import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Clock, MapPin, Sparkles, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  date: z.date({ required_error: "Selecione uma data" }),
  time: z.string().min(1, "Selecione um horário"),
  location: z.string().min(5, "Endereço deve ter no mínimo 5 caracteres").max(500),
  phone: z.string().optional(),
  observations: z.string().max(500).optional(),
  duration: z.string().default("120"),
});

type FormData = z.infer<typeof formSchema>;

export function AppointmentForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      duration: "120",
      phone: "",
      observations: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      // Check for conflicts
      const { data: conflictCheck, error: conflictError } = await supabase
        .rpc('check_appointment_conflict', {
          p_date: format(data.date, 'yyyy-MM-dd'),
          p_time: data.time,
          p_duration: parseInt(data.duration),
        });

      if (conflictError) {
        throw new Error('Erro ao verificar conflitos de horário');
      }

      if (conflictCheck) {
        toast.error('Horário indisponível', {
          description: 'Este horário já está ocupado. Por favor, escolha outro.',
        });
        setIsSubmitting(false);
        return;
      }

      // Create appointment
      const { data: appointment, error: insertError } = await supabase
        .from('appointments')
        .insert({
          appointment_date: format(data.date, 'yyyy-MM-dd'),
          appointment_time: data.time,
          location: data.location,
          customer_phone: data.phone || null,
          observations: data.observations || null,
          duration_minutes: parseInt(data.duration),
        })
        .select()
        .single();

      if (insertError) {
        throw new Error('Erro ao criar agendamento');
      }

      // Send WhatsApp notification
      const { data: notificationData, error: notificationError } = await supabase.functions.invoke('send-whatsapp-notification', {
        body: {
          phone: data.phone,
          date: format(data.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }),
          time: data.time,
          location: data.location,
          observations: data.observations,
        },
      });

      setShowSuccess(true);
      form.reset();

      // Open WhatsApp with pre-filled message after showing success
      if (notificationData?.whatsappUrl) {
        setTimeout(() => {
          window.location.href = notificationData.whatsappUrl;
        }, 1500);
      }
      
      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);

    } catch (error: any) {
      console.error('Error submitting appointment:', error);
      toast.error('Erro ao agendar', {
        description: error.message || 'Tente novamente mais tarde.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate time slots (8:00 to 18:00, every hour)
  const timeSlots = Array.from({ length: 11 }, (_, i) => {
    const hour = i + 8;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 animate-in fade-in duration-500">
        <div className="mb-6 relative">
          <div className="absolute inset-0 bg-secondary/20 blur-3xl rounded-full" />
          <CheckCircle2 className="h-24 w-24 text-secondary relative z-10" />
        </div>
        <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Agendamento Confirmado!
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-md">
          Seu horário foi reservado com sucesso. Em breve você receberá a confirmação via WhatsApp.
        </p>
        <Button 
          onClick={() => setShowSuccess(false)}
          size="lg"
          className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity"
        >
          Fazer Novo Agendamento
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-base font-semibold">Data do Serviço</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-14 text-base border-2 hover:border-primary transition-colors",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-3 h-5 w-5" />
                      {field.value ? format(field.value, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : "Selecione uma data"}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="pointer-events-auto"
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="time"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Horário</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="h-14 text-base border-2 hover:border-primary transition-colors">
                    <div className="flex items-center">
                      <Clock className="mr-3 h-5 w-5" />
                      <SelectValue placeholder="Selecione o horário" />
                    </div>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time} className="text-base">
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Tempo Estimado</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="h-14 text-base border-2 hover:border-primary transition-colors">
                    <div className="flex items-center">
                      <Sparkles className="mr-3 h-5 w-5" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="60">1 hora (limpeza rápida)</SelectItem>
                  <SelectItem value="120">2 horas (limpeza padrão)</SelectItem>
                  <SelectItem value="180">3 horas (limpeza completa)</SelectItem>
                  <SelectItem value="240">4 horas (limpeza profunda)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Endereço</FormLabel>
              <FormControl>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                  <Input 
                    placeholder="Rua, número, bairro, cidade..." 
                    className="pl-12 h-14 text-base border-2 hover:border-primary focus:border-primary transition-colors" 
                    {...field} 
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Telefone (opcional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="(31) 98025-2821" 
                  className="h-14 text-base border-2 hover:border-primary focus:border-primary transition-colors" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="observations"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Observações (opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detalhes sobre o serviço, acesso ao local, etc."
                  className="min-h-24 text-base border-2 hover:border-primary focus:border-primary transition-colors resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity shadow-lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Agendando..." : "Confirmar Agendamento"}
        </Button>
      </form>
    </Form>
  );
}
