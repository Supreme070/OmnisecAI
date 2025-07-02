
import { motion } from "framer-motion";
import { ArrowRight, Shield, Zap, Brain, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { FeaturesSection } from "@/components/features/FeaturesSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { BuiltForYourTeamSection } from "@/components/BuiltForYourTeamSection";
import { PricingSection } from "@/components/pricing/PricingSection";
import LogoCarousel from "@/components/LogoCarousel";
import TestimonialsSection from "@/components/TestimonialsSection";
import Footer from "@/components/Footer";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navigation />
      
      {/* Enhanced Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative container px-4 pt-40 pb-20 overflow-hidden"
      >
        {/* Cybersecurity Background Pattern */}
        <div className="absolute inset-0 -z-10 opacity-[0.02] dark:opacity-[0.03]">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M40 40l20-20v40zM20 0l20 20H0zM60 40l20 20V20z'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '80px 80px'
          }} />
        </div>

        {/* Floating Geometric Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          <motion.div
            animate={{ 
              x: [0, 40, 0],
              y: [0, -30, 0],
              rotate: [0, 6, 0]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute top-32 right-20 w-20 h-20 border border-cyan-500/10 rounded-2xl"
          />
          <motion.div
            animate={{ 
              x: [0, -35, 0],
              y: [0, 25, 0],
              rotate: [0, -4, 0]
            }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear", delay: 5 }}
            className="absolute bottom-40 left-24 w-16 h-16 border border-purple-500/10 rounded-full"
          />
          <motion.div
            animate={{ 
              x: [0, 25, 0],
              y: [0, -15, 0],
              rotate: [45, 51, 45]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear", delay: 8 }}
            className="absolute top-1/2 left-1/3 w-12 h-12 border border-emerald-500/10 rotate-45"
          />
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-block mb-6 px-6 py-2 rounded-full bg-background/80 dark:bg-slate-900/80 backdrop-blur-xl border border-border/50 shadow-lg"
        >
          <span className="text-sm font-medium text-foreground flex items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <Shield className="w-4 h-4 text-primary" />
            </motion.div>
            <span className="font-mono">OMNISECAI_SECURITY.exe</span>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse delay-200" />
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse delay-400" />
            </div>
          </span>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl">
          {/* Enhanced Left Content */}
          <div className="relative z-10 space-y-8">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-7xl font-normal mb-6 tracking-tight text-left font-mono"
            >
              <span className="text-muted-foreground">
                <TextGenerateEffect words="End-to-End Security for the" />
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent font-bold">
                <TextGenerateEffect words="Entire AI Lifecycle" />
              </span>
            </motion.h1>

            {/* Status Indicators */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-4 mb-6"
            >
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-medium">MODELS_PROTECTED: 2,847</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse delay-200" />
                <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-medium">THREATS_BLOCKED: 99.97%</span>
              </div>
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-muted-foreground mb-8 text-left leading-relaxed"
            >
              Comprehensive cybersecurity platform protecting AI models, LLMs, and cloud infrastructure from development to production.{" "}
              <span className="text-foreground font-medium">Secure your AI assets with enterprise-grade protection.</span>
            </motion.p>

            {/* Progress Indicator */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="mb-8"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-mono text-muted-foreground">Security Coverage</span>
                <span className="text-sm font-mono text-muted-foreground">98.7%</span>
              </div>
              <div className="w-full bg-muted/30 rounded-full h-2">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "98.7%" }}
                  transition={{ delay: 0.8, duration: 2, ease: "easeOut" }}
                  className="h-2 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"
                />
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 items-start"
            >
              <Button size="lg" className="button-gradient shadow-lg shadow-primary/25 font-mono">
                <Shield className="w-4 h-4 mr-2" />
                Request a Demo
              </Button>
              <Button size="lg" variant="link" className="text-foreground hover:text-primary transition-colors font-mono">
                View Security Features <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </motion.div>
          </div>

          {/* Right Dashboard */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="relative"
          >
            {/* Main Dashboard Container */}
            <div className="relative bg-gradient-to-br from-background/95 to-muted/95 dark:from-slate-900/95 dark:to-slate-800/95 backdrop-blur-xl rounded-2xl p-1 border border-border shadow-2xl">
              <div className="bg-gradient-to-br from-background/90 to-muted/90 dark:from-slate-900/80 dark:to-slate-800/80 rounded-2xl p-4">
                
                {/* Dashboard Header with Advanced Styling */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-border dark:border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background dark:border-slate-900 animate-pulse"></div>
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-base font-mono">
                        <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                          OmnisecAI
                        </span>{" "}
                        Security Platform
                      </h3>
                      <p className="text-muted-foreground text-xs font-medium">AI Threat Intelligence Center</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-full flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-600 dark:text-green-400 text-xs font-semibold">ACTIVE</span>
                    </div>
                  </div>
                </div>

                {/* Advanced Security Status Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {/* AI Model Security Score */}
                  <div className="relative bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 rounded-lg p-3 border border-emerald-200 dark:border-emerald-500/20 overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-200/30 dark:bg-emerald-500/10 rounded-full -translate-y-6 translate-x-6"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                          <Shield className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="text-emerald-800 dark:text-emerald-100 text-sm font-semibold">AI Security</span>
                      </div>
                      <div className="flex items-end gap-1">
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">98.7</div>
                        <div className="text-emerald-500 dark:text-emerald-300 text-sm font-medium mb-0.5">%</div>
                      </div>
                      <div className="text-emerald-600/70 dark:text-emerald-200/70 text-xs">Threat Protection Score</div>
                      {/* Progress Bar */}
                      <div className="mt-2 w-full bg-emerald-200 dark:bg-emerald-900/30 rounded-full h-1">
                        <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-1 rounded-full w-[98.7%]"></div>
                      </div>
                    </div>
                  </div>

                  {/* LLM Red Team Tests */}
                  <div className="relative bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg p-3 border border-blue-200 dark:border-blue-500/20 overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-blue-200/30 dark:bg-blue-500/10 rounded-full -translate-y-6 translate-x-6"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                          <Brain className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-blue-800 dark:text-blue-100 text-sm font-semibold">LLM Tests</span>
                      </div>
                      <div className="flex items-end gap-1">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">1,247</div>
                        <div className="text-green-600 dark:text-green-400 text-sm font-medium mb-0.5">+12</div>
                      </div>
                      <div className="text-blue-600/70 dark:text-blue-200/70 text-xs">Active Red Team Scans</div>
                      {/* Activity Indicator */}
                      <div className="mt-2 flex gap-0.5">
                        {[...Array(8)].map((_, i) => (
                          <div key={i} className={`h-1.5 w-0.5 rounded-full ${i < 6 ? 'bg-blue-500 dark:bg-blue-400' : 'bg-blue-300 dark:bg-blue-800'} animate-pulse`} style={{animationDelay: `${i * 0.1}s`}}></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Threat Intelligence Display */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-foreground text-sm font-bold flex items-center gap-2">
                      <div className="w-5 h-5 rounded-lg bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                        <Eye className="w-3 h-3 text-red-600 dark:text-red-400" />
                      </div>
                      Live Threat Intelligence
                    </h4>
                    <div className="text-muted-foreground text-xs font-medium">Last scan: 2s ago</div>
                  </div>
                  
                  <div className="space-y-2">
                    {/* Critical Threat */}
                    <div className="relative bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/40 dark:to-red-800/40 rounded-lg p-3 border border-red-200 dark:border-red-500/30 overflow-hidden">
                      <div className="absolute inset-0 bg-red-100/50 dark:bg-red-500/5 animate-pulse"></div>
                      <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                          <div>
                            <div className="text-red-800 dark:text-red-100 text-sm font-semibold">Advanced Prompt Injection</div>
                            <div className="text-red-600/70 dark:text-red-200/70 text-xs">GPT-4 Model • Chain-of-Thought Attack</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-red-600 dark:text-red-400 text-xs font-bold">BLOCKED</div>
                          <div className="text-red-500/70 dark:text-red-300/70 text-xs">0.23ms</div>
                        </div>
                      </div>
                    </div>

                    {/* Warning */}
                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30 rounded-lg p-2.5 border border-amber-200 dark:border-amber-500/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
                          <div>
                            <div className="text-amber-800 dark:text-amber-100 text-sm font-medium">Anomalous API Usage</div>
                            <div className="text-amber-600/70 dark:text-amber-200/70 text-xs">Model: claude-3.5-sonnet • 347% above baseline</div>
                          </div>
                        </div>
                        <div className="text-amber-600 dark:text-amber-400 text-xs font-semibold">MONITORING</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analytics Grid */}
                <div className="grid grid-cols-4 gap-2">
                  {/* Real-time Monitoring */}
                  <div className="bg-gradient-to-br from-muted/50 to-muted/70 dark:from-slate-800/50 dark:to-slate-700/50 rounded-lg p-2 border border-border dark:border-slate-600/30 text-center">
                    <div className="text-cyan-600 dark:text-cyan-400 text-sm font-bold">24/7</div>
                    <div className="text-muted-foreground dark:text-slate-300 text-xs font-medium">Monitoring</div>
                    <div className="mt-1 flex justify-center">
                      <div className="w-4 h-0.5 bg-cyan-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  
                  {/* Models Protected */}
                  <div className="bg-gradient-to-br from-muted/50 to-muted/70 dark:from-slate-800/50 dark:to-slate-700/50 rounded-lg p-2 border border-border dark:border-slate-600/30 text-center">
                    <div className="text-blue-600 dark:text-blue-400 text-sm font-bold">2,847</div>
                    <div className="text-muted-foreground dark:text-slate-300 text-xs font-medium">Models</div>
                    <div className="mt-1 w-full bg-muted dark:bg-slate-700 rounded-full h-0.5">
                      <div className="bg-blue-500 dark:bg-blue-400 h-0.5 rounded-full w-3/4"></div>
                    </div>
                  </div>

                  {/* Uptime */}
                  <div className="bg-gradient-to-br from-muted/50 to-muted/70 dark:from-slate-800/50 dark:to-slate-700/50 rounded-lg p-2 border border-border dark:border-slate-600/30 text-center">
                    <div className="text-green-600 dark:text-green-400 text-sm font-bold">99.97%</div>
                    <div className="text-muted-foreground dark:text-slate-300 text-xs font-medium">Uptime</div>
                    <div className="mt-1 flex justify-center gap-0.5">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="w-0.5 h-2 bg-green-500 rounded-full animate-pulse" style={{animationDelay: `${i * 0.2}s`}}></div>
                      ))}
                    </div>
                  </div>

                  {/* Zero Breaches */}
                  <div className="bg-gradient-to-br from-muted/50 to-muted/70 dark:from-slate-800/50 dark:to-slate-700/50 rounded-lg p-2 border border-border dark:border-slate-600/30 text-center">
                    <div className="text-emerald-600 dark:text-emerald-400 text-sm font-bold">0</div>
                    <div className="text-muted-foreground dark:text-slate-300 text-xs font-medium">Breaches</div>
                    <div className="mt-1 flex justify-center">
                      <div className="w-3 h-3 border border-emerald-500 rounded-full flex items-center justify-center">
                        <div className="w-0.5 h-0.5 bg-emerald-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Sophisticated Border Effects */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-blue-600/10 opacity-30 blur-lg"></div>
            </div>

            {/* Advanced Floating Elements */}
            <div className="absolute -top-6 -right-6 w-12 h-12 bg-gradient-to-br from-cyan-500/30 to-blue-600/30 rounded-full animate-pulse shadow-lg"></div>
            <div className="absolute -bottom-6 -left-6 w-8 h-8 bg-gradient-to-br from-emerald-500/30 to-green-600/30 rounded-full animate-pulse delay-300 shadow-lg"></div>
            <div className="absolute top-1/3 -right-3 w-6 h-6 bg-gradient-to-br from-red-500/30 to-pink-600/30 rounded-full animate-bounce delay-500"></div>
          </motion.div>
        </div>

      </motion.section>

      {/* Logo Carousel */}
      <LogoCarousel />

      {/* Features Section */}
      <div id="features" className="bg-background">
        <FeaturesSection />
      </div>

      {/* How It Works Section */}
      <div className="bg-background">
        <HowItWorksSection />
      </div>

      {/* Built for Your Team Section */}
      <div className="bg-background">
        <BuiltForYourTeamSection />
      </div>

      {/* Testimonials Section */}
      <div className="bg-background">
        <TestimonialsSection />
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="bg-background">
        <PricingSection />
      </div>

      {/* Enhanced CTA Section */}
      <section className="container px-4 py-24 relative bg-muted/20 overflow-hidden">
        {/* Cybersecurity Background Pattern */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='70' height='70' viewBox='0 0 70 70' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M35 35l17-17v34zM18 0l17 17H0zM52 35l18 18V17z'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '70px 70px'
          }} />
        </div>

        {/* Floating Geometric Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ 
              x: [0, 40, 0],
              y: [0, -30, 0],
              rotate: [0, 8, 0]
            }}
            transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
            className="absolute top-20 right-12 w-18 h-18 border border-cyan-500/10 rounded-3xl"
          />
          <motion.div
            animate={{ 
              x: [0, -35, 0],
              y: [0, 25, 0]
            }}
            transition={{ duration: 32, repeat: Infinity, ease: "linear", delay: 8 }}
            className="absolute bottom-24 left-16 w-14 h-14 border border-purple-500/10 rounded-full"
          />
          <motion.div
            animate={{ 
              x: [0, 30, 0],
              y: [0, -20, 0],
              rotate: [45, 53, 45]
            }}
            transition={{ duration: 24, repeat: Infinity, ease: "linear", delay: 12 }}
            className="absolute top-1/2 left-1/4 w-10 h-10 border border-emerald-500/10 rotate-45"
          />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative bg-gradient-to-br from-background/95 to-muted/95 dark:from-slate-900/95 dark:to-slate-800/95 backdrop-blur-xl border-2 border-border/50 shadow-2xl rounded-3xl p-8 md:p-16 text-center relative z-10 max-w-4xl mx-auto overflow-hidden"
        >
          {/* Circuit Board Pattern */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
            <div className="absolute top-4 left-4 w-20 h-px bg-gradient-to-r from-cyan-500 to-transparent" />
            <div className="absolute top-4 left-4 w-px h-20 bg-gradient-to-b from-cyan-500 to-transparent" />
            <div className="absolute bottom-4 right-4 w-20 h-px bg-gradient-to-l from-purple-500 to-transparent" />
            <div className="absolute bottom-4 right-4 w-px h-20 bg-gradient-to-t from-purple-500 to-transparent" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-emerald-500/20 rounded-full" />
          </div>

          {/* Status Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-block mb-6 px-6 py-2 rounded-full bg-background/80 dark:bg-slate-900/80 backdrop-blur-xl border border-border/50 shadow-lg relative z-10"
          >
            <span className="text-sm font-medium text-foreground flex items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <Shield className="w-4 h-4 text-primary" />
              </motion.div>
              <span className="font-mono">OMNISECAI_STATUS: READY_TO_DEPLOY</span>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse delay-200" />
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse delay-400" />
              </div>
            </span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl md:text-6xl font-normal mb-6 tracking-tight font-mono relative z-10"
          >
            <span className="text-foreground">Ready to</span>{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent font-bold">
              Secure
            </span>
            <br />
            <span className="text-foreground">Your AI Infrastructure?</span>
          </motion.h2>

          {/* Enhanced Security Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-4 mb-8 relative z-10"
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-sm font-mono text-emerald-600 dark:text-emerald-400 font-medium">99.97% UPTIME</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse delay-200" />
              <span className="text-sm font-mono text-cyan-600 dark:text-cyan-400 font-medium">ZERO BREACHES</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-400" />
              <span className="text-sm font-mono text-purple-600 dark:text-purple-400 font-medium">24/7 MONITORING</span>
            </div>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed relative z-10"
          >
            Join leading organizations who trust{" "}
            <span className="text-foreground font-bold font-mono bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              OmnisecAI
            </span>{" "}
            to protect their AI models, LLMs, and cloud infrastructure with enterprise-grade security.
          </motion.p>

          {/* Progress Indicator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-8 max-w-md mx-auto relative z-10"
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-mono text-muted-foreground">Deployment Readiness</span>
              <span className="text-sm font-mono text-muted-foreground">100%</span>
            </div>
            <div className="w-full bg-muted/30 rounded-full h-2">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 1, duration: 2, ease: "easeOut" }}
                className="h-2 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"
              />
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="relative z-10"
          >
            <Button size="lg" className="button-gradient shadow-lg shadow-primary/25 font-mono text-lg px-8 py-6 hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 mr-3" />
              Request a Demo
              <ArrowRight className="ml-3 w-5 h-5" />
            </Button>
            <p className="text-xs text-muted-foreground mt-4 font-mono">
              Enterprise security teams trust DONE for mission-critical AI protection
            </p>
          </motion.div>

          {/* Scan Line Effect */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              duration: 5,
              repeat: Infinity,
              repeatDelay: 15,
              ease: "linear"
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent"
          />
        </motion.div>
      </section>

      {/* Footer */}
      <div className="bg-background">
        <Footer />
      </div>
    </div>
  );
};

export default Index;
