import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChatThread } from "@/components/chat-thread"
import { useAuth } from "@/contexts/auth-context"
import { useMyClient } from "./client-pages"
import { PageHeader } from "./panel-ui"

export function ClientChat() {
  const { user } = useAuth()
  const client = useMyClient()

  if (!client) {
    return (
      <>
        <PageHeader title="Chat con mi entrenador" />
        <Card>
          <CardContent className="space-y-3 p-6">
            <p className="text-muted-foreground">
              Aún no tienes un plan activo — una vez que lo tengas, podrás escribirle directo a Jesús.
            </p>
            <Button asChild>
              <Link to="/">Ver planes</Link>
            </Button>
          </CardContent>
        </Card>
      </>
    )
  }

  return (
    <>
      <PageHeader title="Chat con mi entrenador" description="Escríbele directo a Jesús Torres." />
      <ChatThread
        clientId={client.id}
        senderRole="cliente"
        senderName={user?.name ?? client.name}
        emptyHint="Todavía no has escrito nada. Cuéntale a Jesús en qué te puede ayudar."
      />
    </>
  )
}
