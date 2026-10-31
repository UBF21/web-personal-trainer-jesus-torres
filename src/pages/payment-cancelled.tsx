import { XCircle } from "lucide-react"
import { Link } from "react-router-dom"
import { useTranslation } from "@/contexts/language-context"

export default function PaymentCancelledPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
            <XCircle className="w-12 h-12 text-gray-500" />
          </div>
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-foreground">
            {t.payment.cancelTitle}
          </h1>
          <p className="text-muted-foreground">{t.payment.cancelBody}</p>
        </div>
        <Link
          to="/#plans"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
        >
          {t.payment.backHome}
        </Link>
      </div>
    </div>
  )
}
