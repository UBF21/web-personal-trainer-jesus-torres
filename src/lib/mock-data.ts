// MAQUETA: datos ficticios para el panel. Se reemplazan por Supabase más adelante.
import { es } from "@/i18n"

export interface MockClient {
  id: string
  name: string
  email: string
  plan: string
  status: "Activo" | "Pausado" | "Nuevo"
  since: string
  progress: number
}

// Usada hoy solo por la lista de "Usuarios y roles" del webmaster (ver
// webmaster-pages.tsx) — los clientes reales ahora vienen del backend
// (ver clients-context.tsx), esto quedó como contenido de ejemplo.
export const CLIENTS: MockClient[] = [
  { id: "1", name: "Carlos Mendoza", email: "cliente@jttraining.com", plan: "Plan Avanzado", status: "Activo", since: "Sep 2026", progress: 17 },
  { id: "2", name: "Laura Gómez", email: "laura.gomez@mail.com", plan: "Plan VIP", status: "Activo", since: "Ago 2026", progress: 25 },
  { id: "3", name: "Andrés Ruiz", email: "andres.ruiz@mail.com", plan: "Plan Básico", status: "Activo", since: "Oct 2026", progress: 33 },
  { id: "4", name: "Marta Vidal", email: "marta.vidal@mail.com", plan: "Plan Avanzado", status: "Pausado", since: "Jun 2026", progress: 42 },
  { id: "5", name: "Diego Fernández", email: "diego.f@mail.com", plan: "Plan VIP", status: "Activo", since: "Jul 2026", progress: 33 },
  { id: "6", name: "Sofía Ramírez", email: "sofia.r@mail.com", plan: "Plan Básico", status: "Nuevo", since: "Nov 2026", progress: 5 },
  { id: "7", name: "Javier Prieto", email: "javier.prieto@mail.com", plan: "Plan Avanzado", status: "Activo", since: "Oct 2026", progress: 8 },
  { id: "8", name: "Elena Castro", email: "elena.castro@mail.com", plan: "Plan Básico", status: "Nuevo", since: "Nov 2026", progress: 8 },
]

export interface MockPlan {
  id: number
  name: string
  price: number
  duration: string
  months: number
  description: string
  features: string[]
  popular: boolean
}

// Los mismos planes de la landing (textos de i18n + precios de components/training-plans.tsx)
const PLAN_PRICES = [400, 1200, 3000]
const PLAN_MONTHS = [3, 12, 12]

export const PLANS: MockPlan[] = es.plans.items.map((item, i) => ({
  id: i + 1,
  name: item.name,
  price: PLAN_PRICES[i],
  duration: item.duration,
  months: PLAN_MONTHS[i],
  description: item.description,
  features: item.features,
  popular: i === 1,
}))

export interface MockAppointment {
  id: number
  day: string
  time: string
  client: string
  type: string
  place: string
  status: "Confirmada" | "Pendiente"
}

export const APPOINTMENTS: MockAppointment[] = [
  { id: 1, day: "Hoy", time: "18:00", client: "Carlos Mendoza", type: "Fuerza — tren superior", place: "Gimnasio JT", status: "Confirmada" },
  { id: 2, day: "Hoy", time: "19:30", client: "Laura Gómez", type: "Sesión 1:1", place: "Gimnasio JT", status: "Confirmada" },
  { id: 3, day: "Mañana", time: "07:30", client: "Diego Fernández", type: "Hipertrofia — pierna", place: "Gimnasio JT", status: "Confirmada" },
  { id: 4, day: "Mañana", time: "18:00", client: "Andrés Ruiz", type: "Evaluación inicial", place: "Gimnasio JT", status: "Pendiente" },
  { id: 5, day: "Jue 5 nov", time: "18:00", client: "Carlos Mendoza", type: "Fuerza — tren inferior", place: "Gimnasio JT", status: "Confirmada" },
  { id: 6, day: "Vie 6 nov", time: "08:00", client: "Sofía Ramírez", type: "Primera sesión", place: "Online", status: "Pendiente" },
]

export const WEEK_ROUTINE: { day: string; focus: string; exercises: string[] }[] = [
  { day: "Lunes", focus: "Fuerza — tren superior", exercises: ["Press banca 4×8", "Remo con barra 4×8", "Press militar 3×10", "Fondos 3×12"] },
  { day: "Martes", focus: "Descanso activo", exercises: ["Caminata 40 min", "Movilidad 15 min"] },
  { day: "Miércoles", focus: "Hipertrofia — pierna", exercises: ["Sentadilla 4×8", "Peso muerto rumano 4×8", "Prensa 3×12", "Gemelos 4×15"] },
  { day: "Jueves", focus: "Fuerza — tren inferior", exercises: ["Sentadilla frontal 4×6", "Hip thrust 4×8", "Zancadas 3×10"] },
  { day: "Viernes", focus: "Full body + core", exercises: ["Dominadas 4×6", "Press inclinado 3×10", "Plancha 3×45s", "Rueda abdominal 3×10"] },
  { day: "Sábado", focus: "Cardio", exercises: ["HIIT 25 min", "Estiramientos 10 min"] },
  { day: "Domingo", focus: "Descanso", exercises: ["Descanso total"] },
]

export interface Exercise {
  name: string
  /** Series×repeticiones o duración ("4×8", "40 min"); "—" si no aplica. */
  scheme: string
}

export interface RoutineDay {
  day: string
  focus: string
  /** Sin ejercicios = día de descanso. */
  exercises: Exercise[]
}

/** Separa "Press banca 4×8" en nombre y esquema. */
export function parseExercise(text: string): Exercise {
  const m = text.match(/^(.*?)\s+(\d+×\d+s?|\d+ min)$/)
  return m ? { name: m[1], scheme: m[2] } : { name: text, scheme: "—" }
}

/** Copia de la rutina semanal base: cada programa nuevo parte de ella y luego se edita. */
export function baseRoutine(): RoutineDay[] {
  return WEEK_ROUTINE.map((d) => ({
    day: d.day,
    focus: d.focus,
    exercises: d.exercises[0] === "Descanso total" ? [] : d.exercises.map(parseExercise),
  }))
}

export const CONTACT_MESSAGES: { id: number; from: string; subject: string; when: string; unread: boolean }[] = [
  { id: 1, from: "Pablo Nieto", subject: "Consulta por el Plan VIP", when: "Hace 2 h", unread: true },
  { id: 2, from: "Irene Soler", subject: "¿Hay horarios de mañana?", when: "Hace 5 h", unread: true },
  { id: 3, from: "Raúl Campos", subject: "Quiero empezar en diciembre", when: "Ayer", unread: false },
  { id: 4, from: "Natalia Ortiz", subject: "Entrenamiento para competición", when: "Ayer", unread: false },
]

export const SITE_SECTIONS: { id: string; name: string; visible: boolean }[] = [
  { id: "hero", name: "Portada (Hero)", visible: true },
  { id: "about", name: "Sobre mí", visible: true },
  { id: "services", name: "Servicios", visible: true },
  { id: "credentials", name: "Credenciales", visible: true },
  { id: "plans", name: "Planes de entrenamiento", visible: true },
  { id: "recetas", name: "Recetas", visible: true },
  { id: "contact", name: "Contacto", visible: true },
]

export interface PendingSubscription {
  id: string
  name: string
  email: string
  plan: string
  amount: number
  requestedAt: string
  // Hoy el formulario público solo pide nombre + correo + plan elegido,
  // así que estos quedan vacíos en una solicitud real — el admin confirma
  // el resto a mano cuando llega el comprobante por correo.
  bank?: string
  operation?: string
  voucher?: string
}

export interface TrainingProgram {
  goal: string
  level: string
  perWeek: number
  phase: string
  phaseNumber: number
  updated: string
  notes: string
  routine: RoutineDay[]
}

export interface ClientDetail {
  plan: MockPlan | undefined
  totalWeeks: number
  weeksDone: number
  sessionsTotal: number
  sessionsDone: number
  attendance: number | null
  streakWeeks: number
  startWeight: number
  currentWeight: number
  goalWeight: number
  weightSeries: { label: string; kg: number }[]
  recentSessions: { id: number; date: string; type: string; status: "Completada" | "Falta" }[]
  endsOn: string
  program: TrainingProgram
  paymentMethod: string
}

export const GOALS = ["Pérdida de grasa", "Ganancia de masa muscular", "Recomposición corporal", "Rendimiento deportivo"]
export const LEVELS = ["Principiante", "Intermedio", "Avanzado"]
const PHASES = [
  { name: "Adaptación y técnica", notes: "Priorizamos la técnica y la movilidad antes de subir cargas. Registra cómo te sientes tras cada sesión." },
  { name: "Hipertrofia", notes: "Fase de volumen: progresión de cargas semana a semana. Cuida la proteína y el descanso entre sesiones." },
  { name: "Definición y rendimiento", notes: "Bajamos el volumen y subimos la intensidad. El cardio se ajusta según la evolución del peso." },
]

export const PHASE_NAMES = PHASES.map((p) => p.name)

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
const SESSIONS_PER_WEEK = [2, 2, 3] // Básico, Avanzado, VIP

/** Hash determinista simple: el id real es un uuid (string), no un número. */
function hashId(id: string): number {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

/** Suma meses a una etiqueta tipo "Sep 2026". */
function addMonths(label: string, n: number): string {
  const [m, y] = label.split(" ")
  const idx = MONTHS.indexOf(m)
  if (idx < 0) return label
  const total = idx + n
  return `${MONTHS[total % 12]} ${Number(y) + Math.floor(total / 12)}`
}

// MAQUETA: el detalle se deriva de forma determinista del cliente (mismo cliente, mismos números).
// Con Supabase saldrá de las tablas de suscripciones, sesiones y mediciones.
export function getClientDetail(client: MockClient): ClientDetail {
  const h = hashId(client.id)
  const plan = PLANS.find((p) => p.name === client.plan)
  const weeks = plan ? Math.round(plan.months * 4.33) : 13
  const perWeek = plan ? SESSIONS_PER_WEEK[PLANS.indexOf(plan)] : 2
  const sessionsTotal = weeks * perWeek
  const weeksDone = Math.round((client.progress / 100) * weeks)
  const sessionsDone = Math.round((client.progress / 100) * sessionsTotal)

  const startWeight = 70 + ((h * 7) % 25)
  const goalWeight = startWeight - (6 + (h % 5))
  const currentWeight = Math.round((startWeight - ((startWeight - goalWeight) * client.progress) / 100) * 10) / 10

  const points = 7
  const weightSeries = Array.from({ length: points }, (_, i) => {
    const t = i / (points - 1)
    const wiggle = Math.sin(h * 3 + i * 1.7) * 0.4
    const kg = startWeight - (startWeight - currentWeight) * t + (i === 0 || i === points - 1 ? 0 : wiggle)
    return { label: i === points - 1 ? "Hoy" : `Sem ${i + 1}`, kg: Math.round(kg * 10) / 10 }
  })

  const focuses = WEEK_ROUTINE.filter((d) => d.exercises.length > 1).map((d) => d.focus)
  const dates = ["Hoy", "Hace 2 días", "Hace 4 días", "Hace 6 días", "Hace 9 días"]
  // Solo hay sesiones registradas si ya tuvo alguna (un cliente nuevo no tiene historial)
  const recentSessions = dates.slice(0, Math.min(dates.length, sessionsDone)).map((date, i) => ({
    id: i,
    date,
    type: focuses[(h + i) % focuses.length],
    status: (h % 4 === 0 && i === 2 ? "Falta" : "Completada") as "Completada" | "Falta",
  }))

  const phaseIdx = client.progress < 25 ? 0 : client.progress < 60 ? 1 : 2
  const program: TrainingProgram = {
    goal: GOALS[h % GOALS.length],
    level: client.progress < 25 ? LEVELS[(h % 2)] : LEVELS[1 + (h % 2)],
    perWeek,
    phase: PHASES[phaseIdx].name,
    phaseNumber: phaseIdx + 1,
    updated: "Hace 3 días",
    notes: PHASES[phaseIdx].notes,
    routine: baseRoutine(),
  }

  return {
    plan,
    program,
    totalWeeks: weeks,
    weeksDone,
    sessionsTotal,
    sessionsDone,
    attendance: sessionsDone > 0 ? 80 + ((h * 3) % 19) : null,
    streakWeeks: Math.min(weeksDone, 3 + (h % 6)),
    startWeight,
    currentWeight,
    goalWeight,
    weightSeries,
    recentSessions,
    endsOn: addMonths(client.since, plan?.months ?? 3),
    paymentMethod: "Transferencia bancaria",
  }
}

export interface NutritionGuide {
  calories: number
  protein: number
  carbs: number
  fats: number
  water: string
  meals: { name: string; time: string; foods: string[] }[]
  supplements: string[]
  notes: string
  updated: string
}

// kcal por kg de peso según el objetivo del programa
const KCAL_PER_KG: Record<string, number> = {
  "Pérdida de grasa": 28,
  "Ganancia de masa muscular": 38,
  "Recomposición corporal": 33,
  "Rendimiento deportivo": 36,
}

const NUTRITION_NOTES: Record<string, string> = {
  "Pérdida de grasa": "Déficit moderado y sostenido. Prioriza proteína en cada comida y no recortes los carbohidratos del entreno.",
  "Ganancia de masa muscular": "Ligero superávit calórico. Reparte los carbohidratos alrededor del entrenamiento y no te saltes comidas.",
  "Recomposición corporal": "Calorías de mantenimiento con proteína alta. Ajustamos cada dos semanas según la evolución del peso.",
  "Rendimiento deportivo": "Carbohidratos altos en los días de más carga y buena hidratación. Planifica la comida pre y post entreno.",
}

/** Guía de nutrición adecuada al cliente (MAQUETA: valores calculados a partir de su peso y objetivo). */
export function buildNutritionGuide(weightKg: number, goal: string): NutritionGuide {
  const calories = Math.round((weightKg * (KCAL_PER_KG[goal] ?? 33)) / 50) * 50
  const protein = Math.round(weightKg * 2)
  const fats = Math.round(weightKg * 0.9)
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fats * 9) / 4))

  return {
    calories,
    protein,
    carbs,
    fats,
    water: "Mínimo 2,5 L de agua al día, más 500 ml por cada hora de entrenamiento.",
    meals: [
      { name: "Desayuno", time: "08:00", foods: ["Avena con fruta", "3 huevos o yogur proteico", "Café o té sin azúcar"] },
      { name: "Almuerzo", time: "13:30", foods: ["Pollo, pavo o pescado", "Arroz o patata", "Verduras y aceite de oliva"] },
      { name: "Merienda / Pre-entreno", time: "17:00", foods: ["Plátano o tostada con pavo", "Fruta de temporada", "Puñado de frutos secos"] },
      { name: "Cena", time: "21:00", foods: ["Pescado blanco o tortilla", "Ensalada grande", "Legumbres o boniato"] },
    ],
    supplements: ["Proteína whey (1 scoop post-entreno)", "Creatina monohidrato (5 g al día)", "Omega-3 con la comida principal"],
    notes: NUTRITION_NOTES[goal] ?? "Ajustamos la pauta cada dos semanas según tu evolución.",
    updated: "Hace 3 días",
  }
}
