import { motion } from "framer-motion";
import { ArrowRight, Plug, Shield, Search, FileText } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Integrate",
    description: "Seamlessly connect your AI models, LLMs, and cloud infrastructure to our security platform",
    icon: <Plug className="w-8 h-8" />,
    details: ["API Integration", "Cloud Connectors", "Model Onboarding", "Environment Setup"],
    color: "cyan"
  },
  {
    number: "02", 
    title: "Protect",
    description: "Deploy comprehensive security measures across your entire AI lifecycle",
    icon: <Shield className="w-8 h-8" />,
    details: ["Model Protection", "Runtime Security", "Access Controls", "Data Pipeline Security"],
    color: "emerald"
  },
  {
    number: "03",
    title: "Detect & Respond", 
    description: "Monitor threats in real-time and automatically respond to security incidents",
    icon: <Search className="w-8 h-8" />,
    details: ["Threat Detection", "Behavioral Analysis", "Incident Response", "Automated Remediation"],
    color: "purple"
  },
  {
    number: "04",
    title: "Report & Comply",
    description: "Generate compliance reports and maintain governance across your AI systems", 
    icon: <FileText className="w-8 h-8" />,
    details: ["Compliance Reporting", "Audit Trails", "Risk Assessment", "Governance Analytics"],
    color: "amber"
  }
];

const getStepTheme = (color: string) => {
  switch (color) {
    case "cyan":
      return {
        accent: "text-cyan-400 dark:text-cyan-300",
        bg: "bg-cyan-500/5 dark:bg-cyan-500/10",
        border: "border-cyan-500/20 dark:border-cyan-400/30",
        glow: "shadow-cyan-500/20",
        progress: "from-cyan-500 to-cyan-400"
      };
    case "emerald":
      return {
        accent: "text-emerald-400 dark:text-emerald-300",
        bg: "bg-emerald-500/5 dark:bg-emerald-500/10", 
        border: "border-emerald-500/20 dark:border-emerald-400/30",
        glow: "shadow-emerald-500/20",
        progress: "from-emerald-500 to-emerald-400"
      };
    case "purple":
      return {
        accent: "text-purple-400 dark:text-purple-300",
        bg: "bg-purple-500/5 dark:bg-purple-500/10",
        border: "border-purple-500/20 dark:border-purple-400/30", 
        glow: "shadow-purple-500/20",
        progress: "from-purple-500 to-purple-400"
      };
    case "amber":
      return {
        accent: "text-amber-400 dark:text-amber-300",
        bg: "bg-amber-500/5 dark:bg-amber-500/10",
        border: "border-amber-500/20 dark:border-amber-400/30",
        glow: "shadow-amber-500/20", 
        progress: "from-amber-500 to-amber-400"
      };
    default:
      return {
        accent: "text-primary",
        bg: "bg-primary/5",
        border: "border-primary/20",
        glow: "shadow-primary/20",
        progress: "from-primary to-primary"
      };
  }
};

export const HowItWorksSection = () => {
  return (
    <section className="container px-4 py-24 bg-background relative overflow-hidden">
      {/* Cybersecurity Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M20 20l10-10v20zM10 0l10 10H0zM30 20l10 10V10z'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ 
            x: [0, 25, 0],
            y: [0, -15, 0],
            rotate: [0, 3, 0]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute top-16 right-8 w-12 h-12 border border-cyan-500/10 rounded-lg"
        />
        <motion.div
          animate={{ 
            x: [0, -20, 0],
            y: [0, 10, 0] 
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear", delay: 3 }}
          className="absolute bottom-20 left-12 w-8 h-8 border border-emerald-500/10 rounded-full"
        />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-normal mb-6 tracking-tight font-mono">
            <span className="text-foreground">How It</span>{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent font-bold">
              Works
            </span>
          </h2>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse delay-200" />
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse delay-400" />
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse delay-600" />
            </div>
            <span className="text-xs font-mono text-muted-foreground">PROCESS_STATUS: ACTIVE</span>
          </div>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Our streamlined 4-step process ensures comprehensive AI security from integration to compliance
          </p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-16">
          {steps.map((step, index) => {
            const theme = getStepTheme(step.color);
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12`}
              >
                {/* Content */}
                <div className="flex-1 space-y-6">
                  <div className="flex items-center gap-4">
                    <motion.div 
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      className={`
                        flex items-center justify-center w-16 h-16 rounded-xl 
                        ${theme.bg} ${theme.accent} border-2 ${theme.border}
                        ${theme.glow} shadow-lg backdrop-blur-sm
                        transform-gpu relative overflow-hidden
                      `}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative z-10">
                        {step.icon}
                      </div>
                    </motion.div>
                    <div>
                      <div className={`text-sm font-mono font-medium ${theme.accent} mb-1`}>
                        STEP_{step.number}
                      </div>
                      <h3 className={`text-3xl font-bold ${theme.accent}`}>{step.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`w-8 h-0.5 bg-gradient-to-r ${theme.progress} opacity-60`} />
                        <span className="text-xs font-mono text-muted-foreground">ACTIVE</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-lg text-foreground/80 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Progress Indicator */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-mono text-muted-foreground">Implementation</span>
                      <span className="text-xs font-mono text-muted-foreground">100%</span>
                    </div>
                    <div className="w-full bg-muted/30 rounded-full h-1">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: "100%" }}
                        viewport={{ once: true }}
                        transition={{ delay: (index * 0.2) + 0.5, duration: 1.5, ease: "easeOut" }}
                        className={`h-1 rounded-full bg-gradient-to-r ${theme.progress}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {step.details.map((detail, detailIndex) => (
                      <motion.div 
                        key={detail}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: (index * 0.2) + (detailIndex * 0.1) + 0.3 }}
                        className={`
                          flex items-center gap-2 text-sm p-2 rounded-lg
                          ${theme.bg} border ${theme.border}
                          backdrop-blur-sm
                        `}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${step.color === 'cyan' ? 'bg-cyan-400' : step.color === 'emerald' ? 'bg-emerald-400' : step.color === 'purple' ? 'bg-purple-400' : 'bg-amber-400'} animate-pulse`}></div>
                        <span className={`font-mono font-medium ${theme.accent}`}>{detail}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Enhanced Visual Element */}
                <div className="flex-1 relative">
                  <motion.div 
                    whileHover={{ scale: 1.02, y: -4 }}
                    transition={{ duration: 0.3 }}
                    className={`
                      relative w-full h-72 rounded-2xl overflow-hidden group
                      ${theme.bg} border-2 ${theme.border}
                      ${theme.glow} shadow-xl backdrop-blur-sm
                      cursor-pointer
                    `}
                  >
                    {/* Circuit Lines */}
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-20" />
                    <div className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-l from-transparent via-current to-transparent opacity-20" />
                    
                    {/* Status Indicator */}
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${step.color === 'cyan' ? 'bg-cyan-400' : step.color === 'emerald' ? 'bg-emerald-400' : step.color === 'purple' ? 'bg-purple-400' : 'bg-amber-400'} animate-pulse`} />
                      <span className="text-xs font-mono text-muted-foreground opacity-70">READY</span>
                    </div>

                    <div className={`absolute inset-0 bg-gradient-to-br ${theme.progress.replace('from-', 'from-').replace('to-', 'to-')}/10 group-hover:${theme.progress.replace('from-', 'from-').replace('to-', 'to-')}/20 transition-all duration-500`}></div>
                    
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className={`text-8xl font-bold opacity-10 group-hover:opacity-20 transition-opacity duration-500 font-mono ${theme.accent}`}>
                        {step.number}
                      </div>
                    </div>
                    
                    <div className={`absolute top-6 left-6 opacity-20 group-hover:opacity-30 transition-opacity duration-500 ${theme.accent}`}>
                      {step.icon}
                    </div>

                    {/* Scan Line Effect */}
                    <motion.div
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        repeatDelay: 8,
                        ease: "linear"
                      }}
                      className={`absolute inset-0 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-5`}
                    />
                  </motion.div>
                </div>

                {/* Enhanced Arrow */}
                {index < steps.length - 1 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: (index * 0.2) + 1 }}
                    className="hidden lg:flex absolute left-1/2 transform -translate-x-1/2 mt-20 items-center gap-2"
                  >
                    <div className="w-8 h-px bg-gradient-to-r from-primary/40 to-primary/20" />
                    <ArrowRight className="w-6 h-6 text-primary/60 animate-pulse" />
                    <div className="w-8 h-px bg-gradient-to-l from-primary/40 to-primary/20" />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};