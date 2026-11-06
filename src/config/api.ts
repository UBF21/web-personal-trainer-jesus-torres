import { supabase } from "@/lib/supabase"

// Ya no hay backend Express de por medio: todo (galería, planes, clientes)
// habla directo con Supabase. La escritura está protegida por políticas RLS
// que exigen rol administrador/webmaster en el JWT (ver
// supabase/migrations/0006_direct_access_policies.sql) — nunca por este
// archivo, que corre en el navegador.

const BUCKET_NAME = "jt-Images"

// Cuando una Edge Function responde con un status que no es 2xx,
// supabase-js la trata como error y su .message es siempre el mismo texto
// genérico ("Edge Function returned a non-2xx status code") — el motivo
// real queda en el cuerpo de la respuesta (error.context), hay que leerlo
// aparte.
async function functionErrorMessage(error: unknown): Promise<string> {
  const ctx = (error as { context?: Response })?.context
  if (ctx && typeof ctx.json === "function") {
    try {
      const body = await ctx.clone().json()
      if (body?.error) return body.error as string
    } catch {
      // el cuerpo no era JSON — se usa el mensaje genérico de abajo
    }
  }
  return error instanceof Error ? error.message : "No se pudo completar la operación"
}

export interface GalleryImage {
  id: string
  name: string
  url: string
  category: string
  alt?: string
  order?: number
  active?: boolean
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface Plan {
  id: string
  name: string
  nameEn?: string | null
  price: number
  duration: string
  durationEn?: string | null
  description: string
  descriptionEn?: string | null
  features: string[]
  featuresEn?: string[] | null
  popular: boolean
  order?: number | null
  createdAt: string
  updatedAt: string
}

export type PlanInput = Omit<Plan, "id" | "order" | "createdAt" | "updatedAt">

export interface ApiClient {
  id: string
  name: string
  email: string
  plan: string
  status: "Activo" | "Pausado" | "Nuevo"
  progress: number
  createdAt: string
}

export interface PendingSubscription {
  id: string
  name: string
  email: string
  plan: string
  amount: number
  bank?: string | null
  operation?: string | null
  voucher?: string | null
  createdAt: string
}

export interface PendingSubscriptionInput {
  name: string
  email: string
  plan: string
  amount: number
  bank?: string | null
  operation?: string | null
  voucher?: string | null
}

export type ChatSenderRole = "cliente" | "entrenador"

export interface ChatMessage {
  id: string
  clientId: string
  senderRole: ChatSenderRole
  senderName: string
  body: string
  attachmentUrl?: string | null
  attachmentName?: string | null
  attachmentType?: string | null
  createdAt: string
}

export interface ChatAttachment {
  url: string
  name: string
  type: string
}

function mapImageRow(row: any): GalleryImage {
  return {
    id: row.id,
    name: row.name,
    url: row.url,
    category: row.category,
    alt: row.alt,
    order: row.order,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapPlanRow(row: any): Plan {
  return {
    id: row.id,
    name: row.name,
    nameEn: row.name_en,
    price: Number(row.price),
    duration: row.duration,
    durationEn: row.duration_en,
    description: row.description,
    descriptionEn: row.description_en,
    features: row.features ?? [],
    featuresEn: row.features_en,
    popular: row.popular,
    order: row.order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapClientRow(row: any): ApiClient {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    plan: row.plan,
    status: row.status,
    progress: row.progress,
    createdAt: row.created_at,
  }
}

function mapMessageRow(row: any): ChatMessage {
  return {
    id: row.id,
    clientId: row.client_id,
    senderRole: row.sender_role,
    senderName: row.sender_name,
    body: row.body ?? "",
    attachmentUrl: row.attachment_url,
    attachmentName: row.attachment_name,
    attachmentType: row.attachment_type,
    createdAt: row.created_at,
  }
}

function mapPendingRow(row: any): PendingSubscription {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    plan: row.plan,
    amount: Number(row.amount),
    bank: row.bank,
    operation: row.operation,
    voucher: row.voucher,
    createdAt: row.created_at,
  }
}

/** Una unidad menos que el mínimo actual, para que la foto recién subida
 * aparezca primero en el carrusel sin tener que reordenar las demás. */
async function nextImageOrder(category: string): Promise<number> {
  const { data } = await supabase
    .from("images")
    .select("order")
    .eq("category", category)
    .order("order", { ascending: true, nullsFirst: false })
    .limit(1)
    .maybeSingle()

  return typeof data?.order === "number" ? data.order - 1 : 0
}

async function nextPlanOrder(): Promise<number> {
  const { data } = await supabase
    .from("plans")
    .select("order")
    .order("order", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle()

  return typeof data?.order === "number" ? data.order + 1 : 0
}

export const api = {
  images: {
    getAll: async (): Promise<ApiResponse<GalleryImage[]>> => {
      const { data, error } = await supabase
        .from("images")
        .select("*")
        .order("order", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: true })
      if (error) return { success: false, error: error.message }
      return { success: true, data: data.map(mapImageRow) }
    },
    getByCategory: async (category: string, activeOnly = false): Promise<ApiResponse<GalleryImage[]>> => {
      let query = supabase
        .from("images")
        .select("*")
        .eq("category", category)
        .order("order", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: true })
      if (activeOnly) query = query.eq("active", true)
      const { data, error } = await query
      if (error) return { success: false, error: error.message }
      return { success: true, data: data.map(mapImageRow) }
    },
    getById: async (id: string): Promise<ApiResponse<GalleryImage>> => {
      const { data, error } = await supabase.from("images").select("*").eq("id", id).maybeSingle()
      if (error || !data) return { success: false, error: error?.message || "Image not found" }
      return { success: true, data: mapImageRow(data) }
    },
    upload: async (file: File, category: string, alt?: string): Promise<ApiResponse<GalleryImage>> => {
      const path = `${category}/${Date.now()}-${file.name}`
      const { data: uploaded, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(path, file, { contentType: file.type, upsert: false })
      if (uploadError) return { success: false, error: uploadError.message }

      const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(uploaded.path)
      const order = await nextImageOrder(category)
      const nowIso = new Date().toISOString()

      const { data, error } = await supabase
        .from("images")
        .insert({
          id: uploaded.path,
          name: file.name,
          url: urlData.publicUrl,
          category,
          alt: alt || file.name,
          order,
          active: true,
          created_at: nowIso,
          updated_at: nowIso,
        })
        .select("*")
        .single()

      if (error || !data) {
        // No dejar el archivo huérfano en storage si no se pudo guardar la fila.
        await supabase.storage.from(BUCKET_NAME).remove([uploaded.path])
        return { success: false, error: error?.message || "No se pudo guardar la foto" }
      }

      return { success: true, data: mapImageRow(data) }
    },
    delete: async (id: string): Promise<ApiResponse<null>> => {
      const { error: storageError } = await supabase.storage.from(BUCKET_NAME).remove([id])
      if (storageError) return { success: false, error: storageError.message }
      const { error } = await supabase.from("images").delete().eq("id", id)
      if (error) return { success: false, error: error.message }
      return { success: true }
    },
    setActive: async (id: string, active: boolean): Promise<ApiResponse<GalleryImage>> => {
      const { data, error } = await supabase
        .from("images")
        .update({ active, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select("*")
        .single()
      if (error || !data) return { success: false, error: error?.message || "Image not found" }
      return { success: true, data: mapImageRow(data) }
    },
  },
  plans: {
    getAll: async (): Promise<ApiResponse<Plan[]>> => {
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .order("order", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: true })
      if (error) return { success: false, error: error.message }
      return { success: true, data: data.map(mapPlanRow) }
    },
    create: async (input: PlanInput): Promise<ApiResponse<Plan>> => {
      const order = await nextPlanOrder()
      const { data, error } = await supabase
        .from("plans")
        .insert({
          name: input.name,
          name_en: input.nameEn ?? null,
          price: input.price,
          duration: input.duration,
          duration_en: input.durationEn ?? null,
          description: input.description,
          description_en: input.descriptionEn ?? null,
          features: input.features,
          features_en: input.featuresEn ?? null,
          popular: input.popular ?? false,
          order,
        })
        .select("*")
        .single()
      if (error || !data) return { success: false, error: error?.message || "No se pudo crear el plan" }
      return { success: true, data: mapPlanRow(data) }
    },
    update: async (id: string, input: Partial<PlanInput>): Promise<ApiResponse<Plan>> => {
      const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
      if (input.name !== undefined) patch.name = input.name
      if (input.nameEn !== undefined) patch.name_en = input.nameEn
      if (input.price !== undefined) patch.price = input.price
      if (input.duration !== undefined) patch.duration = input.duration
      if (input.durationEn !== undefined) patch.duration_en = input.durationEn
      if (input.description !== undefined) patch.description = input.description
      if (input.descriptionEn !== undefined) patch.description_en = input.descriptionEn
      if (input.features !== undefined) patch.features = input.features
      if (input.featuresEn !== undefined) patch.features_en = input.featuresEn
      if (input.popular !== undefined) patch.popular = input.popular

      const { data, error } = await supabase.from("plans").update(patch).eq("id", id).select("*").single()
      if (error || !data) return { success: false, error: error?.message || "Plan not found" }
      return { success: true, data: mapPlanRow(data) }
    },
    delete: async (id: string): Promise<ApiResponse<null>> => {
      const { error } = await supabase.from("plans").delete().eq("id", id)
      if (error) return { success: false, error: error.message }
      return { success: true }
    },
  },
  clients: {
    getAll: async (): Promise<ApiResponse<ApiClient[]>> => {
      const { data, error } = await supabase.from("clients").select("*").order("created_at", { ascending: true })
      if (error) return { success: false, error: error.message }
      return { success: true, data: data.map(mapClientRow) }
    },
    getPending: async (): Promise<ApiResponse<PendingSubscription[]>> => {
      const { data, error } = await supabase
        .from("pending_subscriptions")
        .select("*")
        .order("created_at", { ascending: true })
      if (error) return { success: false, error: error.message }
      return { success: true, data: data.map(mapPendingRow) }
    },
    createPending: async (input: PendingSubscriptionInput): Promise<ApiResponse<PendingSubscription>> => {
      // Edge Function (no un insert directo): además de guardar la
      // solicitud, manda la confirmación al comprador y avisa al negocio
      // por correo — eso necesita la API key de Resend, que no puede
      // vivir en el navegador.
      const { data, error } = await supabase.functions.invoke("request-subscription", { body: input })
      if (error) return { success: false, error: await functionErrorMessage(error) }
      if (!data?.success) return { success: false, error: data?.error || "No se pudo registrar la solicitud" }
      return { success: true, data: mapPendingRow(data.data), message: data.warning }
    },
    approvePending: async (id: string): Promise<ApiResponse<ApiClient>> => {
      // Edge Function (no una llamada directa a la tabla): crear la cuenta
      // de acceso del cliente y mandar el correo requiere la service_role
      // key, que no puede vivir en el navegador.
      const { data, error } = await supabase.functions.invoke("approve-subscription", {
        body: { pending_id: id },
      })
      if (error) return { success: false, error: await functionErrorMessage(error) }
      if (!data?.success) return { success: false, error: data?.error || "No se pudo aprobar la suscripción" }
      return { success: true, data: mapClientRow(data.data), message: data.warning }
    },
    rejectPending: async (id: string): Promise<ApiResponse<null>> => {
      const { error } = await supabase.from("pending_subscriptions").delete().eq("id", id)
      if (error) return { success: false, error: error.message }
      return { success: true }
    },
  },
  settings: {
    getMaintenanceMode: async (): Promise<ApiResponse<boolean>> => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("maintenance_mode")
        .eq("id", "default")
        .maybeSingle()
      if (error) return { success: false, error: error.message }
      return { success: true, data: data?.maintenance_mode ?? false }
    },
    setMaintenanceMode: async (enabled: boolean): Promise<ApiResponse<boolean>> => {
      const { error } = await supabase
        .from("site_settings")
        .update({ maintenance_mode: enabled, updated_at: new Date().toISOString() })
        .eq("id", "default")
      if (error) return { success: false, error: error.message }
      return { success: true, data: enabled }
    },
  },
  messages: {
    getByClient: async (clientId: string): Promise<ApiResponse<ChatMessage[]>> => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: true })
      if (error) return { success: false, error: error.message }
      return { success: true, data: data.map(mapMessageRow) }
    },
    send: async (
      clientId: string,
      senderRole: ChatSenderRole,
      senderName: string,
      body: string,
      attachment?: ChatAttachment,
    ): Promise<ApiResponse<ChatMessage>> => {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          client_id: clientId,
          sender_role: senderRole,
          sender_name: senderName,
          body: body || null,
          attachment_url: attachment?.url ?? null,
          attachment_name: attachment?.name ?? null,
          attachment_type: attachment?.type ?? null,
        })
        .select("*")
        .single()
      if (error || !data) return { success: false, error: error?.message || "No se pudo enviar el mensaje" }
      return { success: true, data: mapMessageRow(data) }
    },
    uploadAttachment: async (clientId: string, file: File): Promise<ApiResponse<ChatAttachment>> => {
      const path = `chat/${clientId}/${Date.now()}-${file.name}`
      const { data, error } = await supabase.storage
        .from("chat-attachments")
        .upload(path, file, { contentType: file.type })
      if (error) return { success: false, error: error.message }

      const { data: urlData } = supabase.storage.from("chat-attachments").getPublicUrl(data.path)
      return { success: true, data: { url: urlData.publicUrl, name: file.name, type: file.type } }
    },
  },
}
