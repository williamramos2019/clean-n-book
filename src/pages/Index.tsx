import { Sparkles, Shield, Clock, CheckCircle } from "lucide-react";
import { AppointmentForm } from "@/components/AppointmentForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-3">
            <div className="relative">
              <Sparkles className="h-8 w-8 text-primary" />
              <div className="absolute inset-0 blur-xl bg-primary/30" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
              Auto Limpeza Pro
            </h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Higienização Profissional</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Estofados Limpos,
            <br />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Ambiente Saudável
            </span>
          </h2>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Agende seu serviço de limpeza profissional de forma rápida e fácil. 
            Qualidade garantida e horários flexíveis.
          </p>

          {/* Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 rounded-xl bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Profissionais</h3>
              <p className="text-sm text-muted-foreground text-center">Equipe qualificada</p>
            </div>
            
            <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 rounded-xl bg-secondary/10">
                <Clock className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-semibold">Pontualidade</h3>
              <p className="text-sm text-muted-foreground text-center">No horário marcado</p>
            </div>
            
            <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 rounded-xl bg-primary/10">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Garantia</h3>
              <p className="text-sm text-muted-foreground text-center">Satisfação total</p>
            </div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="pb-16 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-card rounded-3xl shadow-xl border border-border p-6 md:p-8">
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-2">Agendar Serviço</h3>
              <p className="text-muted-foreground">
                Preencha os dados abaixo para reservar seu horário
              </p>
            </div>
            
            <AppointmentForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border bg-muted/30">
        <div className="container mx-auto max-w-2xl text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Auto Limpeza Pro - Higienização de Estofados
          </p>
          <p className="text-sm text-muted-foreground">
            WhatsApp: (31) 98025-2821
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
