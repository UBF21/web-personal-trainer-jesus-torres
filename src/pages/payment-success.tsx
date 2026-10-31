import { CheckCircle2 } from "lucide-react"
import { Link } from "react-router-dom"
import { useTranslation } from "@/contexts/language-context"

export default function PaymentSuccessPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-foreground">
            {t.payment.successTitle}
          </h1>
          <p className="text-muted-foreground">{t.payment.successBody}</p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
        >
          {t.payment.backHome}
        </Link>
      </div>
    </div>
  )
}
