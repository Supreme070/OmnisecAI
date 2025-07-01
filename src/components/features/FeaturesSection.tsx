
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { aiSecurityFeatures } from "@/config/ai-security-features";
import { motion } from "framer-motion";

export const FeaturesSection = () => {
  const categories = Object.keys(aiSecurityFeatures);
  
  // Professional cybersecurity color mapping
  const getCategoryTheme = (category: string) => {
    switch (category) {
      case "Core AI Security":
        return {
          accent: "text-cyan-400 dark:text-cyan-300",
          bg: "bg-cyan-500/5 dark:bg-cyan-500/10",
          border: "border-cyan-500/20 dark:border-cyan-400/30",
          badge: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/20",
          glow: "shadow-cyan-500/10"
        };
      case "LLM & Advanced Security":
        return {
          accent: "text-purple-400 dark:text-purple-300",
          bg: "bg-purple-500/5 dark:bg-purple-500/10",
          border: "border-purple-500/20 dark:border-purple-400/30",
          badge: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
          glow: "shadow-purple-500/10"
        };
      case "Security Operations":
        return {
          accent: "text-emerald-400 dark:text-emerald-300",
          bg: "bg-emerald-500/5 dark:bg-emerald-500/10",
          border: "border-emerald-500/20 dark:border-emerald-400/30",
          badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
          glow: "shadow-emerald-500/10"
        };
      case "Governance & Analytics":
        return {
          accent: "text-amber-400 dark:text-amber-300",
          bg: "bg-amber-500/5 dark:bg-amber-500/10",
          border: "border-amber-500/20 dark:border-amber-400/30",
          badge: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
          glow: "shadow-amber-500/10"
        };
      default:
        return {
          accent: "text-slate-400",
          bg: "bg-slate-500/5",
          border: "border-slate-500/20",
          badge: "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20",
          glow: "shadow-slate-500/10"
        };
    }
  };
  
  return (
    <section className="container px-4 py-24 relative overflow-hidden">
      {/* Subtle Cybersecurity Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M30 30l15-15v30zM15 0l15 15H0zM45 30l15 15V15z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Floating Geometric Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ 
            x: [0, 30, 0],
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 right-10 w-16 h-16 border border-primary/10 rounded-lg"
        />
        <motion.div
          animate={{ 
            x: [0, -25, 0],
            y: [0, 15, 0],
            rotate: [0, -3, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 5 }}
          className="absolute bottom-32 left-16 w-12 h-12 border border-emerald-500/10 rounded-full"
        />
        <motion.div
          animate={{ 
            x: [0, 20, 0],
            y: [0, -10, 0],
            rotate: [45, 50, 45]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear", delay: 10 }}
          className="absolute top-1/2 left-1/4 w-8 h-8 border border-cyan-500/10 rotate-45"
        />
      </div>

      {/* Header Section */}
      <div className="max-w-4xl mb-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-6xl font-normal mb-6 tracking-tight text-left font-mono">
            <span className="text-foreground">Comprehensive AI Security</span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent font-bold">
              Platform Features
            </span>
          </h2>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse delay-300" />
              <div className="w-3 h-3 rounded-full bg-cyan-500 animate-pulse delay-700" />
            </div>
            <span className="text-sm font-mono text-muted-foreground">SECURITY_STATUS: ACTIVE</span>
          </div>
          <p className="text-lg md:text-xl text-muted-foreground text-left leading-relaxed">
            Four integrated security categories covering the entire AI lifecycle - from development to production deployment.
          </p>
        </motion.div>
      </div>

      <Tabs defaultValue={categories[0]} className="w-full relative z-10">
        {/* Enhanced Category Tabs */}
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-16 bg-background/80 dark:bg-slate-900/80 backdrop-blur-xl border border-border/50 rounded-xl p-1 shadow-lg">
          {categories.map((category, index) => {
            const theme = getCategoryTheme(category);
            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <TabsTrigger 
                  value={category}
                  className={`
                    relative group
                    data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/90 data-[state=active]:to-primary
                    data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg
                    transition-all duration-500 rounded-lg font-medium text-sm
                    hover:scale-[1.02] transform-gpu
                    ${theme.glow}
                  `}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-current opacity-60 group-data-[state=active]:animate-pulse" />
                    {category}
                  </span>
                </TabsTrigger>
              </motion.div>
            );
          })}
        </TabsList>

        {/* Enhanced Category Content */}
        {categories.map((category) => {
          const theme = getCategoryTheme(category);
          return (
            <TabsContent key={category} value={category} className="mt-0">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                {aiSecurityFeatures[category].map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.15, duration: 0.6 }}
                    whileHover={{ 
                      y: -4,
                      transition: { duration: 0.2 }
                    }}
                    className="transform-gpu"
                  >
                    <Card className={`
                      relative h-full group cursor-pointer overflow-hidden
                      bg-background/50 dark:bg-slate-900/50
                      border ${theme.border}
                      ${theme.glow} shadow-lg hover:shadow-xl
                      backdrop-blur-sm
                      transition-all duration-500
                      hover:scale-[1.02]
                      before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/5 before:to-transparent 
                      before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300
                    `}>
                      {/* Circuit Board Lines */}
                      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                      <div className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-l from-transparent via-primary/20 to-transparent" />
                      
                      {/* Status Indicator */}
                      <div className="absolute top-4 right-4 flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${theme.accent.includes('cyan') ? 'bg-cyan-400' : theme.accent.includes('purple') ? 'bg-purple-400' : theme.accent.includes('emerald') ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
                        <span className="text-xs font-mono text-muted-foreground opacity-70">SECURE</span>
                      </div>

                      <CardHeader className="pb-4 relative z-10">
                        <div className="flex items-center gap-4 mb-4">
                          <motion.div 
                            whileHover={{ 
                              rotate: 360,
                              scale: 1.1
                            }}
                            transition={{ duration: 0.6 }}
                            className={`
                              p-3 rounded-xl ${theme.bg}
                              ${theme.accent}
                              shadow-md backdrop-blur-sm
                              border ${theme.border}
                              transform-gpu
                              relative overflow-hidden
                            `}
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="relative z-10">
                              {feature.icon}
                            </div>
                          </motion.div>
                          <div className="flex-1">
                            <CardTitle className={`text-xl font-bold ${theme.accent} mb-1`}>
                              {feature.title}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                              <div className="w-12 h-0.5 bg-gradient-to-r from-current to-transparent opacity-30" />
                              <span className="text-xs font-mono text-muted-foreground">ACTIVE</span>
                            </div>
                          </div>
                        </div>
                        <CardDescription className="text-foreground/80 leading-relaxed">
                          {feature.description}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="relative z-10">
                        {/* Mini Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-mono text-muted-foreground">Coverage</span>
                            <span className="text-xs font-mono text-muted-foreground">98.7%</span>
                          </div>
                          <div className="w-full bg-muted/30 rounded-full h-1">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: "98.7%" }}
                              transition={{ delay: (index * 0.1) + 0.5, duration: 1.5, ease: "easeOut" }}
                              className={`h-1 rounded-full bg-gradient-to-r ${
                                theme.accent.includes('cyan') ? 'from-cyan-500 to-cyan-400' :
                                theme.accent.includes('purple') ? 'from-purple-500 to-purple-400' :
                                theme.accent.includes('emerald') ? 'from-emerald-500 to-emerald-400' :
                                'from-amber-500 to-amber-400'
                              }`}
                            />
                          </div>
                        </div>

                        {/* Feature Badges */}
                        <div className="flex flex-wrap gap-2">
                          {feature.features.map((featureItem, featureIndex) => (
                            <motion.div
                              key={featureItem}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ 
                                delay: (index * 0.1) + (featureIndex * 0.05) + 0.3,
                                duration: 0.3 
                              }}
                              whileHover={{ scale: 1.05 }}
                            >
                              <Badge 
                                variant="secondary" 
                                className={`
                                  text-xs font-medium px-2.5 py-1
                                  ${theme.badge}
                                  border backdrop-blur-sm
                                  hover:shadow-sm
                                  transition-all duration-300
                                  font-mono
                                `}
                              >
                                {featureItem}
                              </Badge>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>

                      {/* Subtle Scan Line Effect */}
                      <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          repeatDelay: 7,
                          ease: "linear"
                        }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100"
                      />
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </TabsContent>
          );
        })}
      </Tabs>
    </section>
  );
};
