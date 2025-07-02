
import { motion } from "framer-motion";
import { Check, Shield, Zap, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardSpotlight } from "./CardSpotlight";

const PricingTier = ({
  name,
  price,
  description,
  features,
  isPopular,
  tier,
}: {
  name: string;
  price: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  tier: "starter" | "enterprise" | "mission";
}) => {
  // Enhanced tier-specific themes
  const getTierTheme = () => {
    switch (tier) {
      case "starter":
        return {
          accent: "text-cyan-700 dark:text-cyan-400",
          bg: "bg-cyan-500/15 dark:bg-cyan-500/10",
          border: "border-cyan-500/40 dark:border-cyan-400/30",
          icon: <Shield className="w-6 h-6" />,
          glow: "shadow-cyan-500/20"
        };
      case "enterprise":
        return {
          accent: "text-emerald-700 dark:text-emerald-400",
          bg: "bg-emerald-500/15 dark:bg-emerald-500/10",
          border: "border-emerald-500/40 dark:border-emerald-400/30",
          icon: <Zap className="w-6 h-6" />,
          glow: "shadow-emerald-500/20"
        };
      case "mission":
        return {
          accent: "text-purple-700 dark:text-purple-400",
          bg: "bg-purple-500/15 dark:bg-purple-500/10",
          border: "border-purple-500/40 dark:border-purple-400/30",
          icon: <Crown className="w-6 h-6" />,
          glow: "shadow-purple-500/20"
        };
      default:
        return {
          accent: "text-slate-700 dark:text-slate-400",
          bg: "bg-slate-500/15 dark:bg-slate-500/10",
          border: "border-slate-500/40 dark:border-slate-500/30",
          icon: <Shield className="w-6 h-6" />,
          glow: "shadow-slate-500/20"
        };
    }
  };

  const theme = getTierTheme();

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="transform-gpu"
    >
      <CardSpotlight className={`h-full ${isPopular ? `border-2 ${theme.border} ${theme.glow}` : `border border-border dark:border-slate-700/50`} transition-all duration-500`}>
        <div className="relative h-full p-6 flex flex-col overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M20 20l10-10v20zM10 0l10 10H0zM30 20l10 10V10z'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '40px 40px'
            }} />
          </div>

          {/* Circuit Lines */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-20" />
          <div className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-l from-transparent via-current to-transparent opacity-20" />

          {/* Header with Icon */}
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className={`flex items-center gap-3 px-3 py-2 rounded-xl ${theme.bg} ${theme.border} border`}>
              <div className={theme.accent}>
                {theme.icon}
              </div>
              <h3 className="text-xl font-bold text-foreground font-mono">{name}</h3>
            </div>
            {isPopular && (
              <motion.span 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`text-xs font-bold ${theme.bg} ${theme.accent} rounded-full px-3 py-1.5 border ${theme.border} font-mono`}
              >
                MOST POPULAR
              </motion.span>
            )}
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-2 mb-4 relative z-10">
            <div className={`w-2 h-2 rounded-full ${tier === 'starter' ? 'bg-cyan-500' : tier === 'enterprise' ? 'bg-emerald-500' : 'bg-purple-500'} animate-pulse`} />
            <span className="text-xs font-mono text-foreground/70 dark:text-muted-foreground">SECURITY_LEVEL: {tier.toUpperCase()}</span>
          </div>

          {/* Price */}
          <div className="mb-6 relative z-10">
            <div className="flex items-end gap-2">
              <span className={`text-4xl font-bold ${theme.accent} font-mono`}>{price}</span>
              {price !== "Custom" && <span className="text-foreground/60 dark:text-muted-foreground font-medium">/month</span>}
            </div>
            {price !== "Custom" && (
              <div className="mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-mono text-foreground/60 dark:text-muted-foreground">Value</span>
                  <span className="text-xs font-mono text-foreground/60 dark:text-muted-foreground">100%</span>
                </div>
                <div className="w-full bg-muted/30 rounded-full h-1">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }}
                    className={`h-1 rounded-full bg-gradient-to-r ${
                      tier === 'starter' ? 'from-cyan-500 to-cyan-400' :
                      tier === 'enterprise' ? 'from-emerald-500 to-emerald-400' :
                      'from-purple-500 to-purple-400'
                    }`}
                  />
                </div>
              </div>
            )}
          </div>

          <p className="text-foreground/90 dark:text-muted-foreground mb-6 leading-relaxed relative z-10">{description}</p>
          
          {/* Features List */}
          <ul className="space-y-3 mb-8 flex-grow relative z-10">
            {features.map((feature, index) => (
              <motion.li 
                key={index} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className={`flex-shrink-0 w-5 h-5 rounded-full ${theme.bg} ${theme.border} border flex items-center justify-center`}>
                  <Check className={`w-3 h-3 ${theme.accent}`} />
                </div>
                <span className="text-sm text-foreground dark:text-foreground/90 font-medium">{feature}</span>
              </motion.li>
            ))}
          </ul>
          
          {/* Enhanced CTA Button */}
          <Button className={`button-gradient w-full font-mono font-bold relative overflow-hidden group ${theme.glow} shadow-lg`}>
            <span className="relative z-10 flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" />
              {tier === 'mission' ? 'Contact Sales' : 'Get Started'}
            </span>
            {/* Scan Line Effect */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
                ease: "linear"
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100"
            />
          </Button>
        </div>
      </CardSpotlight>
    </motion.div>
  );
};

export const PricingSection = () => {
  return (
    <section className="container px-4 py-24 relative overflow-hidden bg-muted/20">
      {/* Enhanced Cybersecurity Background Pattern */}
      <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.025]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M40 40l20-20v40zM20 0l20 20H0zM60 40l20 20V20z'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '80px 80px'
        }} />
      </div>

      {/* Floating Geometric Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ 
            x: [0, 50, 0],
            y: [0, -30, 0],
            rotate: [0, 10, 0]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-24 right-16 w-20 h-20 border border-cyan-500/10 rounded-3xl"
        />
        <motion.div
          animate={{ 
            x: [0, -40, 0],
            y: [0, 25, 0]
          }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear", delay: 8 }}
          className="absolute bottom-32 left-20 w-16 h-16 border border-emerald-500/10 rounded-full"
        />
        <motion.div
          animate={{ 
            x: [0, 35, 0],
            y: [0, -15, 0],
            rotate: [45, 55, 45]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 15 }}
          className="absolute top-1/2 left-1/3 w-14 h-14 border border-purple-500/10 rotate-45"
        />
      </div>

      <div className="max-w-4xl mx-auto text-center mb-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-6xl font-normal mb-6 tracking-tight font-mono">
            <span className="text-foreground">Choose Your</span>{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent font-bold">
              Security Plan
            </span>
          </h2>
          
          {/* Status Indicators */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse delay-200" />
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse delay-400" />
            </div>
            <span className="text-xs font-mono text-foreground/60 dark:text-muted-foreground">PRICING_PLANS: ENTERPRISE_READY</span>
          </div>
          
          <p className="text-lg md:text-xl text-foreground/90 dark:text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Comprehensive AI cybersecurity solutions tailored to your organization's security requirements and infrastructure scale
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto relative z-10">
        <PricingTier
          name="Starter Shield"
          price="$99"
          description="Essential AI security for small teams and development projects"
          tier="starter"
          features={[
            "Basic AI model scanning & protection",
            "Standard threat detection algorithms",
            "Email support with 48h response",
            "Basic compliance reporting tools",
            "Protection for up to 10 AI models",
            "Monthly security assessments"
          ]}
        />
        <PricingTier
          name="Enterprise Guardian"
          price="$499"
          description="Advanced protection for enterprise AI deployments and production systems"
          tier="enterprise"
          features={[
            "Advanced LLM red teaming & testing",
            "Real-time threat intelligence feeds",
            "Multi-cloud infrastructure protection",
            "24/7 security monitoring & alerts",
            "Priority support with 4h response",
            "Custom API integrations & webhooks",
            "Unlimited AI models & endpoints",
            "Advanced compliance automation"
          ]}
          isPopular
        />
        <PricingTier
          name="Mission Critical"
          price="Custom"
          description="Maximum security for mission-critical AI infrastructure and government deployments"
          tier="mission"
          features={[
            "Custom security architecture design",
            "Dedicated security team assignment",
            "Advanced AI threat modeling (MITRE ATLAS)",
            "Zero-trust AI deployment strategies",
            "Full compliance automation suite",
            "24/7 incident response team",
            "White-glove onboarding & training",
            "Custom SLA agreements"
          ]}
        />
      </div>
    </section>
  );
};
