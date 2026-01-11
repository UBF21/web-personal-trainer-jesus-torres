import { Award, Target, TrendingUp } from "lucide-react"

export function About() {
  return (
    <section id="about" className="py-24 md:py-32 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/10 translate-x-4 translate-y-4" />
            <img
              src="/professional-personal-trainer-portrait-luxury-athl.jpg"
              alt="Elite Personal Trainer"
              className="relative w-full h-auto grayscale hover:grayscale-0 transition-all duration-500"
            />
          </div>

          <div className="space-y-6">
            <div className="inline-block">
              <span className="text-xs font-bold tracking-widest text-primary uppercase">My Story</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-balance">
              Built for the
              <span className="block text-primary">Extraordinary</span>
            </h2>

            <p className="text-muted-foreground leading-relaxed text-pretty">
              With over 15 years of experience training world-class athletes, Fortune 500 executives, and elite
              performers, I've developed a methodology that transcends traditional fitness training. My approach
              integrates cutting-edge sports science, mental conditioning, and personalized nutrition strategies.
            </p>

            <p className="text-muted-foreground leading-relaxed text-pretty">
              After competing professionally and earning certifications from the world's most prestigious fitness
              institutions, I founded Elite Performance Training to serve those who refuse to settle for average. Every
              client receives a bespoke training program designed to unlock peak physical and mental performance.
            </p>

            <div className="grid sm:grid-cols-3 gap-6 pt-6">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-primary/10 flex items-center justify-center">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <p className="text-2xl font-bold">15+</p>
                <p className="text-sm text-muted-foreground">Years Experience</p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-primary/10 flex items-center justify-center">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <p className="text-2xl font-bold">500+</p>
                <p className="text-sm text-muted-foreground">Elite Clients</p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <p className="text-2xl font-bold">98%</p>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
