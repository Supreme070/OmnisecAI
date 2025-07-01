
"use client";

import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card } from "./ui/card";
import { Shield, Quote, CheckCircle } from "lucide-react";

const testimonials = [
  {
    name: "Alex Chen",
    role: "AI Security Engineer",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    content: "DONE's LLM Red Teaming capabilities uncovered critical jailbreaking vulnerabilities in our language models that we never would have found otherwise. The comprehensive testing suite is invaluable."
  },
  {
    name: "Sarah Rodriguez",
    role: "Chief Information Security Officer",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    content: "The Automated Compliance Reporting feature has transformed our regulatory posture. We now generate GDPR and SOC 2 reports in minutes instead of weeks, with complete audit trails."
  },
  {
    name: "Marcus Johnson",
    role: "LLM Security Researcher",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    content: "The AI Threat Modeling module with MITRE ATLAS integration provides structured threat analysis that's essential for our research. The OWASP Top 10 for LLM compliance validation is outstanding."
  },
  {
    name: "Priya Patel",
    role: "Cloud Security Architect",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    content: "DONE's Cloud Environment Analysis automatically discovered vulnerabilities across our multi-cloud AI infrastructure. The vulnerability impact forecasting saved us from potential breaches."
  },
  {
    name: "David Kim",
    role: "Cybersecurity Consultant",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    content: "The LLM Security Testing Suite's prompt injection prevention and jailbreak detection capabilities are industry-leading. Real-time protection against context manipulation attacks is phenomenal."
  },
  {
    name: "Elena Volkov",
    role: "AI Compliance Manager",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    content: "Automated Compliance Reporting with privacy impact assessments and regulatory compliance checking has revolutionized our governance workflows. The audit trail capabilities are comprehensive."
  }
];

const TestimonialsSection = () => {
  return (
    <section className="py-24 overflow-hidden bg-muted/20 relative">
      {/* Cybersecurity Background Pattern */}
      <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.025]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M30 30l15-15v30zM15 0l15 15H0zM45 30l15 15V15z'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ 
            x: [0, 35, 0],
            y: [0, -25, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="absolute top-32 right-16 w-16 h-16 border border-cyan-500/10 rounded-2xl"
        />
        <motion.div
          animate={{ 
            x: [0, -30, 0],
            y: [0, 20, 0]
          }}
          transition={{ duration: 26, repeat: Infinity, ease: "linear", delay: 6 }}
          className="absolute bottom-40 left-20 w-12 h-12 border border-purple-500/10 rounded-full"
        />
      </div>

      <div className="container px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-normal mb-6 tracking-tight font-mono">
            <span className="text-foreground">Trusted by</span>{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent font-bold">
              Security Leaders
            </span>
          </h2>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse delay-200" />
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse delay-400" />
            </div>
            <span className="text-xs font-mono text-muted-foreground">TESTIMONIALS_VERIFIED: TRUE</span>
          </div>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Join thousands of cybersecurity professionals securing AI infrastructure with enterprise-grade protection
          </p>
        </motion.div>

        <div className="relative flex flex-col antialiased">
          <div className="relative flex overflow-hidden py-4">
            <div className="animate-marquee flex min-w-full shrink-0 items-stretch gap-8">
              {testimonials.map((testimonial, index) => {
                const roleTheme = 
                  testimonial.role.includes("CISO") || testimonial.role.includes("Officer") ? {
                    accent: "text-emerald-400 dark:text-emerald-300",
                    bg: "bg-emerald-500/5 dark:bg-emerald-500/10",
                    border: "border-emerald-500/20 dark:border-emerald-400/30",
                    dot: "bg-emerald-500"
                  } :
                  testimonial.role.includes("Engineer") || testimonial.role.includes("AI") ? {
                    accent: "text-cyan-400 dark:text-cyan-300",
                    bg: "bg-cyan-500/5 dark:bg-cyan-500/10",
                    border: "border-cyan-500/20 dark:border-cyan-400/30",
                    dot: "bg-cyan-500"
                  } : {
                    accent: "text-purple-400 dark:text-purple-300",
                    bg: "bg-purple-500/5 dark:bg-purple-500/10",
                    border: "border-purple-500/20 dark:border-purple-400/30",
                    dot: "bg-purple-500"
                  };
                
                return (
                  <Card key={`${index}-1`} className={`
                    w-[420px] shrink-0 relative overflow-hidden
                    ${roleTheme.bg} border-2 ${roleTheme.border}
                    hover:shadow-lg shadow-lg
                    backdrop-blur-sm transition-all duration-500
                    hover:scale-[1.02] transform-gpu
                    before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/5 before:to-transparent 
                    before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300
                    p-6
                  `}>
                    {/* Quote Icon */}
                    <div className="absolute top-4 right-4">
                      <Quote className="w-6 h-6 text-muted-foreground/30" />
                    </div>

                    {/* Status Indicator */}
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${roleTheme.dot} animate-pulse`} />
                      <span className="text-xs font-mono text-muted-foreground opacity-70">VERIFIED</span>
                    </div>

                    {/* Circuit Lines */}
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-20" />
                    <div className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-l from-transparent via-current to-transparent opacity-20" />
                    
                    <div className="mt-8">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="relative">
                          <Avatar className={`h-14 w-14 border-2 ${roleTheme.border} shadow-lg`}>
                            <AvatarImage src={testimonial.image} />
                            <AvatarFallback className={`${roleTheme.bg} ${roleTheme.accent} font-bold font-mono`}>{testimonial.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${roleTheme.bg} border-2 ${roleTheme.border} rounded-full flex items-center justify-center`}>
                            <Shield className="w-2 h-2 text-current" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-bold text-foreground font-mono ${roleTheme.accent}`}>{testimonial.name}</h4>
                          <p className="text-sm text-muted-foreground font-medium">{testimonial.role}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            <span className="text-xs text-green-600 dark:text-green-400 font-mono">Security Verified</span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-foreground/90 leading-relaxed text-sm relative z-10">
                        {testimonial.content}
                      </p>

                      {/* Progress Indicator */}
                      <div className="mt-4 pt-4 border-t border-current/10">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-mono text-muted-foreground">Satisfaction</span>
                          <span className="text-xs font-mono text-muted-foreground">100%</span>
                        </div>
                        <div className="w-full bg-muted/30 rounded-full h-1">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ delay: index * 0.1, duration: 2, ease: "easeOut" }}
                            className={`h-1 rounded-full bg-gradient-to-r ${
                              roleTheme.accent.includes('emerald') ? 'from-emerald-500 to-emerald-400' :
                              roleTheme.accent.includes('cyan') ? 'from-cyan-500 to-cyan-400' :
                              'from-purple-500 to-purple-400'
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Scan Line Effect */}
                    <motion.div
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        repeatDelay: 10,
                        ease: "linear"
                      }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 hover:opacity-5"
                    />
                  </Card>
                );
              })}
            </div>
            <div className="animate-marquee flex min-w-full shrink-0 items-stretch gap-8">
              {testimonials.map((testimonial, index) => {
                const roleTheme = 
                  testimonial.role.includes("CISO") || testimonial.role.includes("Officer") ? {
                    accent: "text-emerald-400 dark:text-emerald-300",
                    bg: "bg-emerald-500/5 dark:bg-emerald-500/10",
                    border: "border-emerald-500/20 dark:border-emerald-400/30",
                    dot: "bg-emerald-500"
                  } :
                  testimonial.role.includes("Engineer") || testimonial.role.includes("AI") ? {
                    accent: "text-cyan-400 dark:text-cyan-300",
                    bg: "bg-cyan-500/5 dark:bg-cyan-500/10",
                    border: "border-cyan-500/20 dark:border-cyan-400/30",
                    dot: "bg-cyan-500"
                  } : {
                    accent: "text-purple-400 dark:text-purple-300",
                    bg: "bg-purple-500/5 dark:bg-purple-500/10",
                    border: "border-purple-500/20 dark:border-purple-400/30",
                    dot: "bg-purple-500"
                  };
                
                return (
                  <Card key={`${index}-2`} className={`
                    w-[420px] shrink-0 relative overflow-hidden
                    ${roleTheme.bg} border-2 ${roleTheme.border}
                    hover:shadow-lg shadow-lg
                    backdrop-blur-sm transition-all duration-500
                    hover:scale-[1.02] transform-gpu
                    before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/5 before:to-transparent 
                    before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300
                    p-6
                  `}>
                    {/* Quote Icon */}
                    <div className="absolute top-4 right-4">
                      <Quote className="w-6 h-6 text-muted-foreground/30" />
                    </div>

                    {/* Status Indicator */}
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${roleTheme.dot} animate-pulse`} />
                      <span className="text-xs font-mono text-muted-foreground opacity-70">VERIFIED</span>
                    </div>

                    {/* Circuit Lines */}
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-20" />
                    <div className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-l from-transparent via-current to-transparent opacity-20" />
                    
                    <div className="mt-8">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="relative">
                          <Avatar className={`h-14 w-14 border-2 ${roleTheme.border} shadow-lg`}>
                            <AvatarImage src={testimonial.image} />
                            <AvatarFallback className={`${roleTheme.bg} ${roleTheme.accent} font-bold font-mono`}>{testimonial.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${roleTheme.bg} border-2 ${roleTheme.border} rounded-full flex items-center justify-center`}>
                            <Shield className="w-2 h-2 text-current" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-bold text-foreground font-mono ${roleTheme.accent}`}>{testimonial.name}</h4>
                          <p className="text-sm text-muted-foreground font-medium">{testimonial.role}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            <span className="text-xs text-green-600 dark:text-green-400 font-mono">Security Verified</span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-foreground/90 leading-relaxed text-sm relative z-10">
                        {testimonial.content}
                      </p>

                      {/* Progress Indicator */}
                      <div className="mt-4 pt-4 border-t border-current/10">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-mono text-muted-foreground">Satisfaction</span>
                          <span className="text-xs font-mono text-muted-foreground">100%</span>
                        </div>
                        <div className="w-full bg-muted/30 rounded-full h-1">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ delay: index * 0.1, duration: 2, ease: "easeOut" }}
                            className={`h-1 rounded-full bg-gradient-to-r ${
                              roleTheme.accent.includes('emerald') ? 'from-emerald-500 to-emerald-400' :
                              roleTheme.accent.includes('cyan') ? 'from-cyan-500 to-cyan-400' :
                              'from-purple-500 to-purple-400'
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Scan Line Effect */}
                    <motion.div
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        repeatDelay: 10,
                        ease: "linear"
                      }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 hover:opacity-5"
                    />
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
