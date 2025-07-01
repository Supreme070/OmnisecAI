
import { Shield, Brain, Cloud, Lock, Eye, AlertTriangle, Zap, Users, BarChart3, Settings, Search, Bug } from "lucide-react";

export const aiSecurityFeatures = {
  "Core AI Security": [
    {
      title: "Model Protection System",
      description: "Continuous monitoring, watermarking, and integrity verification for AI models",
      features: ["Model Monitoring", "Watermarking & Fingerprinting", "Version Control & Rollback", "Secure Model Serving", "Integrity Verification", "Vulnerability Scanning"],
      icon: <Shield className="w-6 h-6" />,
      image: "/lovable-uploads/7335619d-58a9-41ad-a233-f7826f56f3e9.png",
    },
    {
      title: "Data Pipeline Security",
      description: "Protect data pipelines from poisoning attacks and ensure data integrity",
      features: ["Data Poisoning Detection", "Input Validation", "Data Lineage Tracking", "Quality Checks", "Privacy-Preserving Training", "End-to-End Encryption"],
      icon: <Lock className="w-6 h-6" />,
      image: "/lovable-uploads/21f3edfb-62b5-4e35-9d03-7339d803b980.png",
    },
    {
      title: "Runtime Protection",
      description: "Real-time protection against adversarial attacks and runtime tampering",
      features: ["Adversarial Attack Detection", "Input Fuzzing", "Rate Limiting", "Anomaly Detection", "Request Filtering", "Output Sanitization"],
      icon: <Zap className="w-6 h-6" />,
      image: "/lovable-uploads/c32c6788-5e4a-4fee-afee-604b03113c7f.png",
    },
    {
      title: "Access Control & Authentication",
      description: "Granular access control and secure authentication for AI systems",
      features: ["Fine-Grained Access Control", "API Key Management", "Role-Based Access", "Audit Logging", "Session Management", "Multi-Factor Authentication"],
      icon: <Users className="w-6 h-6" />,
      image: "/lovable-uploads/86329743-ee49-4f2e-96f7-50508436273d.png",
    }
  ],
  "LLM & Advanced Security": [
    {
      title: "LLM Security Testing Suite",
      description: "Comprehensive red teaming and vulnerability assessment for Large Language Models",
      features: ["LLM Enumeration", "Jailbreaking Testing", "Prompt Injection Assessment", "Output Security Analysis", "Supply Chain Simulation", "Excessive Agency Risk Assessment"],
      icon: <Brain className="w-6 h-6" />,
      image: "/lovable-uploads/0dbe1b75-2c74-4ff8-ba55-4be4d74abe72.png",
    },
    {
      title: "AI-Specific Security Features",
      description: "Protection against unique AI threats like prompt injection and model extraction",
      features: ["Traditional AI Attack Protection", "LLM Jailbreaking Protection", "Prompt Injection Prevention", "Output Safety", "Context Manipulation Detection", "Model Restriction Enforcement"],
      icon: <Bug className="w-6 h-6" />,
      image: "/lovable-uploads/e143cef1-4ad0-404b-b47a-147e89bc017c.png",
    },
    {
      title: "Advanced Protection Features",
      description: "Cryptographic methods for secure AI operations and data collaboration",
      features: ["Federated Learning Security", "Differential Privacy", "Secure Multi-party Computation", "Zero-Knowledge Proofs", "Homomorphic Encryption", "Privacy-Preserving Inference"],
      icon: <Lock className="w-6 h-6" />,
      image: "/lovable-uploads/7335619d-58a9-41ad-a233-f7826f56f3e9.png",
    },
    {
      title: "AI Threat Modeling",
      description: "Structured threat modeling to identify and mitigate AI-specific risks",
      features: ["AI Threat Modeling Introduction", "STRIDE & LINDDUN Frameworks", "MITRE ATLAS Integration", "Automated Threat Detection", "LLM-Specific Modeling", "OWASP Top 10 for LLM"],
      icon: <Search className="w-6 h-6" />,
      image: "/lovable-uploads/21f3edfb-62b5-4e35-9d03-7339d803b980.png",
    }
  ],
  "Security Operations": [
    {
      title: "Monitoring & Detection",
      description: "Continuous monitoring and threat detection for AI environments",
      features: ["Real-time Threat Monitoring", "Behavioral Analysis", "Performance Monitoring", "Resource Usage Tracking", "Alert System", "Incident Response Automation"],
      icon: <Eye className="w-6 h-6" />,
      image: "/lovable-uploads/c32c6788-5e4a-4fee-afee-604b03113c7f.png",
    },
    {
      title: "Supply Chain Security",
      description: "Secure the entire AI software and hardware supply chain",
      features: ["Dependency Scanning", "Model Provenance Tracking", "Third-party Validation", "Vulnerability Scanning", "Container Security", "Build Process Security"],
      icon: <Cloud className="w-6 h-6" />,
      image: "/lovable-uploads/e143cef1-4ad0-404b-b47a-147e89bc017c.png",
    },
    {
      title: "Threat Intelligence",
      description: "AI-specific threat intelligence to stay ahead of evolving threats",
      features: ["AI-specific Threat Feeds", "Attack Pattern Detection", "Emerging Threat Alerts", "Attack Surface Monitoring", "Vulnerability Notifications", "MITRE ATLAS Integration"],
      icon: <Search className="w-6 h-6" />,
      image: "/lovable-uploads/86329743-ee49-4f2e-96f7-50508436273d.png",
    },
    {
      title: "Incident Response",
      description: "Swift, automated responses to AI-specific security incidents",
      features: ["Automated Response Playbooks", "Model Quarantine", "Rollback Mechanisms", "Forensic Tools", "Impact Assessment", "Recovery Automation"],
      icon: <AlertTriangle className="w-6 h-6" />,
      image: "/lovable-uploads/7335619d-58a9-41ad-a233-f7826f56f3e9.png",
    }
  ],
  "Governance & Analytics": [
    {
      title: "Compliance & Governance",
      description: "Ensure AI systems adhere to industry standards and regulations",
      features: ["Compliance Reporting", "Policy Enforcement", "Risk Assessment Tools", "Audit Trails", "Privacy Impact Assessment", "Regulatory Compliance"],
      icon: <Settings className="w-6 h-6" />,
      image: "/lovable-uploads/21f3edfb-62b5-4e35-9d03-7339d803b980.png",
    },
    {
      title: "Security Analytics",
      description: "Comprehensive analytics and insights into AI security posture",
      features: ["Security Metrics Dashboard", "Risk Scoring", "Attack Pattern Analysis", "Performance Impact Analysis", "Security Posture Assessment", "Compliance Analytics"],
      icon: <BarChart3 className="w-6 h-6" />,
      image: "/lovable-uploads/c32c6788-5e4a-4fee-afee-604b03113c7f.png",
    },
    {
      title: "Cloud Environment Analysis",
      description: "Assess and improve security of cloud-hosted AI systems",
      features: ["Cloud Environment Integration", "Network Discovery", "Network Setup Assessment", "Security Reports", "Improvement Recommendations", "Vulnerability Forecasting"],
      icon: <Cloud className="w-6 h-6" />,
      image: "/lovable-uploads/e143cef1-4ad0-404b-b47a-147e89bc017c.png",
    },
    {
      title: "DevSecOps Integration",
      description: "Integrate security into AI development and deployment pipelines",
      features: ["CI/CD Vulnerability Scanning", "Secure Deployment Validation", "Container Scanning", "LLM Security Testing", "MLOps Security Validation", "Model Governance Automation"],
      icon: <Settings className="w-6 h-6" />,
      image: "/lovable-uploads/86329743-ee49-4f2e-96f7-50508436273d.png",
    }
  ]
};
