import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Code, Search, CheckCircle } from "lucide-react";

const roles = {
  "CISO": {
    title: "Chief Information Security Officer",
    description: "Get executive-level visibility and control over AI security risks",
    icon: <Shield className="w-8 h-8" />,
    features: [
      {
        title: "Executive Security Dashboard",
        description: "Real-time security posture and risk metrics across all AI systems",
        benefits: ["Risk Visibility", "Compliance Status", "Threat Intelligence", "Resource Allocation"]
      },
      {
        title: "Automated Compliance Reporting",
        description: "Generate comprehensive compliance reports for regulatory requirements",
        benefits: ["GDPR Compliance", "SOC 2 Reports", "Risk Assessments", "Audit Trails"]
      },
      {
        title: "AI Threat Intelligence",
        description: "Stay ahead of emerging AI-specific threats and vulnerabilities",
        benefits: ["Threat Feeds", "Attack Pattern Analysis", "Vulnerability Alerts", "Strategic Planning"]
      }
    ],
    image: "/lovable-uploads/c32c6788-5e4a-4fee-afee-604b03113c7f.png"
  },
  "AI/ML Engineer": {
    title: "AI/ML Engineer",
    description: "Integrate security seamlessly into your AI development workflow",
    icon: <Code className="w-8 h-8" />,
    features: [
      {
        title: "DevSecOps Integration",
        description: "Security testing and validation built into your CI/CD pipelines",
        benefits: ["Automated Testing", "Vulnerability Scanning", "Secure Deployment", "Model Validation"]
      },
      {
        title: "LLM Red Teaming",
        description: "Comprehensive testing suite for Large Language Model vulnerabilities",
        benefits: ["Jailbreak Testing", "Prompt Injection Detection", "Output Safety", "Compliance Validation"]
      },
      {
        title: "Model Protection System",
        description: "Protect your models from theft, tampering, and unauthorized access",
        benefits: ["Model Watermarking", "Integrity Verification", "Access Controls", "Version Management"]
      }
    ],
    image: "/lovable-uploads/0dbe1b75-2c74-4ff8-ba55-4be4d74abe72.png"
  },
  "Security Analyst": {
    title: "Security Analyst",
    description: "Advanced tools for monitoring, detecting, and responding to AI threats",
    icon: <Search className="w-8 h-8" />,
    features: [
      {
        title: "AI Threat Modeling",
        description: "Structured approach to identify and mitigate AI-specific security risks",
        benefits: ["STRIDE Framework", "MITRE ATLAS", "Risk Assessment", "Threat Scenarios"]
      },
      {
        title: "Real-time Monitoring & Detection",
        description: "Continuous monitoring with advanced behavioral analysis and alerting",
        benefits: ["Anomaly Detection", "Behavioral Analysis", "Threat Hunting", "Incident Response"]
      },
      {
        title: "Forensic Analysis Tools",
        description: "Deep investigation capabilities for AI security incidents",
        benefits: ["Attack Reconstruction", "Impact Assessment", "Evidence Collection", "Root Cause Analysis"]
      }
    ],
    image: "/lovable-uploads/e143cef1-4ad0-404b-b47a-147e89bc017c.png"
  }
};

export const BuiltForYourTeamSection = () => {
  const roleKeys = Object.keys(roles);
  
  // Role-specific themes
  const getRoleTheme = (role: string) => {
    switch (role) {
      case "CISO":
        return {
          accent: "text-emerald-400 dark:text-emerald-300",
          bg: "bg-emerald-500/5 dark:bg-emerald-500/10",
          border: "border-emerald-500/20 dark:border-emerald-400/30",
          badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
          glow: "shadow-emerald-500/15"
        };
      case "AI/ML Engineer":
        return {
          accent: "text-cyan-400 dark:text-cyan-300",
          bg: "bg-cyan-500/5 dark:bg-cyan-500/10",
          border: "border-cyan-500/20 dark:border-cyan-400/30",
          badge: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/20",
          glow: "shadow-cyan-500/15"
        };
      case "Security Analyst":
        return {
          accent: "text-purple-400 dark:text-purple-300",
          bg: "bg-purple-500/5 dark:bg-purple-500/10",
          border: "border-purple-500/20 dark:border-purple-400/30",
          badge: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
          glow: "shadow-purple-500/15"
        };
      default:
        return {
          accent: "text-slate-400",
          bg: "bg-slate-500/5",
          border: "border-slate-500/20",
          badge: "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20",
          glow: "shadow-slate-500/15"
        };
    }
  };
  
  return (
    <section className="container px-4 py-24 bg-muted/20 relative overflow-hidden">
      {/* Cybersecurity Background Pattern */}
      <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.025]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 50 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M25 25l12-12v24zM13 0l12 12H0zM37 25l13 13V12z'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ 
            x: [0, 30, 0],
            y: [0, -20, 0],
            rotate: [0, 4, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-24 right-12 w-14 h-14 border border-emerald-500/10 rounded-xl"
        />
        <motion.div
          animate={{ 
            x: [0, -25, 0],
            y: [0, 15, 0]
          }}
          transition={{ duration: 24, repeat: Infinity, ease: "linear", delay: 4 }}
          className="absolute bottom-32 left-16 w-10 h-10 border border-cyan-500/10 rounded-full"
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-normal mb-6 tracking-tight font-mono">
            <span className="text-foreground">Built for</span>{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent font-bold">
              Your Team
            </span>
          </h2>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse delay-200" />
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse delay-400" />
            </div>
            <span className="text-xs font-mono text-muted-foreground">TEAM_ACCESS: GRANTED</span>
          </div>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Tailored experiences for every role in your organization, from strategic oversight to hands-on security operations
          </p>
        </motion.div>

        <Tabs defaultValue={roleKeys[0]} className="w-full">
          {/* Enhanced Role Tabs */}
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 mb-12 bg-background/80 dark:bg-slate-900/80 backdrop-blur-xl border border-border/50 rounded-xl p-1 shadow-lg h-auto">
            {roleKeys.map((roleKey, index) => {
              const role = roles[roleKey];
              const theme = getRoleTheme(roleKey);
              return (
                <motion.div
                  key={roleKey}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <TabsTrigger 
                    value={roleKey}
                    className={`
                      flex items-center gap-3 p-4 rounded-lg group
                      data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/90 data-[state=active]:to-primary
                      data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg
                      transition-all duration-500 h-auto font-medium
                      hover:scale-[1.02] transform-gpu
                      ${theme.glow}
                    `}
                  >
                    <motion.div 
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className="text-primary data-[state=active]:text-primary-foreground transform-gpu"
                    >
                      {role.icon}
                    </motion.div>
                    <div className="text-left">
                      <div className="font-semibold font-mono">{roleKey}</div>
                      <div className="text-xs opacity-80">{role.title}</div>
                      <div className="w-6 h-0.5 bg-current opacity-30 mt-1 group-data-[state=active]:animate-pulse" />
                    </div>
                  </TabsTrigger>
                </motion.div>
              );
            })}
          </TabsList>

          {/* Enhanced Role Content */}
          {roleKeys.map((roleKey) => {
            const role = roles[roleKey];
            const theme = getRoleTheme(roleKey);
            return (
              <TabsContent key={roleKey} value={roleKey} className="mt-0">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-8"
                >
                  {/* Enhanced Role Header */}
                  <div className="text-center space-y-6">
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className={`
                        inline-flex items-center justify-center w-20 h-20 rounded-xl
                        ${theme.bg} ${theme.accent} border-2 ${theme.border}
                        ${theme.glow} shadow-lg backdrop-blur-sm
                        transform-gpu relative overflow-hidden
                      `}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative z-10">
                        {role.icon}
                      </div>
                    </motion.div>
                    <div>
                      <h3 className={`text-2xl font-bold mb-2 font-mono ${theme.accent}`}>
                        {role.title}
                      </h3>
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <div className={`w-8 h-0.5 bg-gradient-to-r ${roleKey === 'CISO' ? 'from-emerald-500 to-emerald-400' : roleKey === 'AI/ML Engineer' ? 'from-cyan-500 to-cyan-400' : 'from-purple-500 to-purple-400'} opacity-60`} />
                        <span className="text-xs font-mono text-muted-foreground">AUTHORIZED</span>
                        <div className={`w-8 h-0.5 bg-gradient-to-l ${roleKey === 'CISO' ? 'from-emerald-500 to-emerald-400' : roleKey === 'AI/ML Engineer' ? 'from-cyan-500 to-cyan-400' : 'from-purple-500 to-purple-400'} opacity-60`} />
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{role.description}</p>
                    </div>
                  </div>

                  {/* Enhanced Features Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {role.features.map((feature, index) => (
                      <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.15, duration: 0.6 }}
                        whileHover={{ y: -4 }}
                        className="transform-gpu"
                      >
                        <Card className={`
                          relative h-full group cursor-pointer overflow-hidden
                          ${theme.bg} border-2 ${theme.border}
                          ${theme.glow} shadow-lg hover:shadow-xl
                          backdrop-blur-sm transition-all duration-500
                          hover:scale-[1.02]
                          before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/5 before:to-transparent 
                          before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300
                        `}>
                          {/* Circuit Lines */}
                          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-20" />
                          <div className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-l from-transparent via-current to-transparent opacity-20" />
                          
                          {/* Status Indicator */}
                          <div className="absolute top-4 right-4 flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${roleKey === 'CISO' ? 'bg-emerald-400' : roleKey === 'AI/ML Engineer' ? 'bg-cyan-400' : 'bg-purple-400'} animate-pulse`} />
                            <span className="text-xs font-mono text-muted-foreground opacity-70">ACTIVE</span>
                          </div>

                          <CardHeader className="relative z-10">
                            <CardTitle className={`text-lg font-bold mb-3 ${theme.accent}`}>
                              {feature.title}
                            </CardTitle>
                            <CardDescription className="text-foreground/80 leading-relaxed">
                              {feature.description}
                            </CardDescription>
                          </CardHeader>
                          
                          <CardContent className="relative z-10">
                            {/* Progress Indicator */}
                            <div className="mb-4">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-mono text-muted-foreground">Capability</span>
                                <span className="text-xs font-mono text-muted-foreground">100%</span>
                              </div>
                              <div className="w-full bg-muted/30 rounded-full h-1">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: "100%" }}
                                  transition={{ delay: (index * 0.1) + 0.5, duration: 1.5, ease: "easeOut" }}
                                  className={`h-1 rounded-full bg-gradient-to-r ${
                                    roleKey === 'CISO' ? 'from-emerald-500 to-emerald-400' :
                                    roleKey === 'AI/ML Engineer' ? 'from-cyan-500 to-cyan-400' :
                                    'from-purple-500 to-purple-400'
                                  }`}
                                />
                              </div>
                            </div>

                            {/* Benefits */}
                            <div className="space-y-2">
                              {feature.benefits.map((benefit, benefitIndex) => (
                                <motion.div 
                                  key={benefit}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: (index * 0.1) + (benefitIndex * 0.05) + 0.3 }}
                                  className="flex items-center gap-2 text-sm"
                                >
                                  <CheckCircle className={`w-4 h-4 ${theme.accent}`} />
                                  <span className={`font-mono font-medium ${theme.accent}`}>{benefit}</span>
                                </motion.div>
                              ))}
                            </div>
                          </CardContent>

                          {/* Scan Line Effect */}
                          <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: "100%" }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              repeatDelay: 8,
                              ease: "linear"
                            }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-5"
                          />
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </section>
  );
};