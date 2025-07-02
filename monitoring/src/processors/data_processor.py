import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any
import json

from ..config.database import get_db_connection, get_mongo_connection

logger = logging.getLogger(__name__)

class DataProcessor:
    """Data processing and report generation"""
    
    def __init__(self):
        self.pg_pool = None
        self.mongo_db = None
    
    async def initialize(self):
        """Initialize the data processor"""
        try:
            self.pg_pool = await get_db_connection()
            self.mongo_db = await get_mongo_connection()
            logger.info("Data processor initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize data processor: {e}")
            raise
    
    async def cleanup(self):
        """Cleanup resources"""
        logger.info("Data processor cleanup completed")
    
    async def generate_security_report(self, organization_id: str, report_type: str = "summary", days: int = 30) -> Dict[str, Any]:
        """Generate comprehensive security report"""
        try:
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=days)
            
            if report_type == "summary":
                return await self._generate_summary_report(organization_id, start_date, end_date)
            elif report_type == "detailed":
                return await self._generate_detailed_report(organization_id, start_date, end_date)
            elif report_type == "executive":
                return await self._generate_executive_report(organization_id, start_date, end_date)
            else:
                raise ValueError(f"Unknown report type: {report_type}")
                
        except Exception as e:
            logger.error(f"Security report generation failed: {e}")
            raise
    
    async def _generate_summary_report(self, organization_id: str, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Generate summary security report"""
        
        # Get data from PostgreSQL
        async with self.pg_pool.acquire() as conn:
            # Threat summary
            threats = await conn.fetch("""
                SELECT threat_type, severity, COUNT(*) as count,
                       COUNT(CASE WHEN is_resolved THEN 1 END) as resolved
                FROM security_threats 
                WHERE organization_id = $1 AND created_at BETWEEN $2 AND $3
                GROUP BY threat_type, severity
            """, organization_id, start_date, end_date)
            
            # Model summary
            models = await conn.fetchrow("""
                SELECT COUNT(*) as total_models,
                       COUNT(CASE WHEN is_active THEN 1 END) as active_models
                FROM ai_models 
                WHERE organization_id = $1
            """, organization_id)
            
            # User activity
            user_activity = await conn.fetchrow("""
                SELECT COUNT(DISTINCT user_id) as active_users,
                       COUNT(*) as total_actions
                FROM audit_logs 
                WHERE organization_id = $1 AND created_at BETWEEN $2 AND $3
            """, organization_id, start_date, end_date)
        
        # Get data from MongoDB
        security_events = await self.mongo_db.security_events.count_documents({
            'organization_id': organization_id,
            'timestamp': {'$gte': start_date, '$lte': end_date}
        })
        
        threat_detections = await self.mongo_db.threat_detection_logs.count_documents({
            'organization_id': organization_id,
            'timestamp': {'$gte': start_date, '$lte': end_date}
        })
        
        # Process threat data
        threat_summary = {}
        total_threats = 0
        resolved_threats = 0
        
        for threat in threats:
            threat_type = threat['threat_type']
            if threat_type not in threat_summary:
                threat_summary[threat_type] = {
                    'total': 0,
                    'resolved': 0,
                    'by_severity': {}
                }
            
            threat_summary[threat_type]['total'] += threat['count']
            threat_summary[threat_type]['resolved'] += threat['resolved']
            threat_summary[threat_type]['by_severity'][threat['severity']] = threat['count']
            
            total_threats += threat['count']
            resolved_threats += threat['resolved']
        
        # Calculate metrics
        resolution_rate = (resolved_threats / total_threats * 100) if total_threats > 0 else 0
        
        report = {
            'report_type': 'summary',
            'organization_id': organization_id,
            'period': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat(),
                'days': (end_date - start_date).days
            },
            'executive_summary': {
                'total_threats': total_threats,
                'resolved_threats': resolved_threats,
                'resolution_rate_percent': round(resolution_rate, 2),
                'security_events': security_events,
                'threat_detections': threat_detections,
                'active_models': models['active_models'],
                'active_users': user_activity['active_users']
            },
            'threat_analysis': {
                'by_type': threat_summary,
                'top_threats': sorted(
                    threat_summary.items(), 
                    key=lambda x: x[1]['total'], 
                    reverse=True
                )[:5]
            },
            'model_security': {
                'total_models': models['total_models'],
                'active_models': models['active_models'],
                'threats_per_model': round(total_threats / max(models['active_models'], 1), 2)
            },
            'recommendations': self._generate_report_recommendations(threat_summary, models, security_events),
            'generated_at': datetime.utcnow().isoformat()
        }
        
        return report
    
    async def _generate_detailed_report(self, organization_id: str, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Generate detailed security report"""
        # This would include more detailed analysis
        summary_report = await self._generate_summary_report(organization_id, start_date, end_date)
        
        # Add detailed sections
        summary_report.update({
            'report_type': 'detailed',
            'detailed_analysis': {
                'temporal_patterns': await self._analyze_temporal_patterns(organization_id, start_date, end_date),
                'model_interactions': await self._analyze_model_interactions(organization_id, start_date, end_date),
                'user_behavior': await self._analyze_user_behavior(organization_id, start_date, end_date),
                'attack_vectors': await self._analyze_attack_vectors(organization_id, start_date, end_date)
            }
        })
        
        return summary_report
    
    async def _generate_executive_report(self, organization_id: str, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Generate executive summary report"""
        summary_report = await self._generate_summary_report(organization_id, start_date, end_date)
        
        # Create executive-focused view
        exec_report = {
            'report_type': 'executive',
            'organization_id': organization_id,
            'period': summary_report['period'],
            'key_metrics': {
                'security_posture_score': self._calculate_security_posture_score(summary_report),
                'threat_trend': self._calculate_threat_trend(summary_report),
                'resolution_efficiency': summary_report['executive_summary']['resolution_rate_percent'],
                'model_coverage': round(summary_report['model_security']['active_models'] / max(summary_report['model_security']['total_models'], 1) * 100, 2)
            },
            'risk_assessment': {
                'current_risk_level': self._assess_risk_level(summary_report),
                'critical_issues': self._identify_critical_issues(summary_report),
                'trending_threats': summary_report['threat_analysis']['top_threats'][:3]
            },
            'strategic_recommendations': self._generate_strategic_recommendations(summary_report),
            'compliance_status': {
                'monitoring_coverage': 'Good',  # Would be calculated based on actual coverage
                'incident_response': 'Adequate',
                'policy_compliance': 'Review Required'
            },
            'generated_at': datetime.utcnow().isoformat()
        }
        
        return exec_report
    
    def _generate_report_recommendations(self, threat_summary: Dict, models: Dict, security_events: int) -> List[str]:
        """Generate actionable recommendations"""
        recommendations = []
        
        # Threat-based recommendations
        if len(threat_summary) > 5:
            recommendations.append("High variety of threat types detected - consider implementing comprehensive threat monitoring")
        
        for threat_type, data in threat_summary.items():
            if data['resolved'] / max(data['total'], 1) < 0.5:
                recommendations.append(f"Low resolution rate for {threat_type} threats - review response procedures")
        
        # Model-based recommendations
        if models['active_models'] < models['total_models'] * 0.8:
            recommendations.append("Consider activating more models or removing inactive ones to improve security posture")
        
        # Activity-based recommendations
        if security_events > 1000:
            recommendations.append("High security event volume - consider implementing automated filtering")
        
        return recommendations
    
    def _calculate_security_posture_score(self, report: Dict) -> int:
        """Calculate overall security posture score (0-100)"""
        base_score = 100
        
        # Deduct for unresolved threats
        resolution_rate = report['executive_summary']['resolution_rate_percent']
        resolution_penalty = (100 - resolution_rate) * 0.5
        
        # Deduct for high threat volume
        threat_volume_penalty = min(report['executive_summary']['total_threats'] * 2, 30)
        
        # Deduct for inactive models
        model_coverage = report['model_security']['active_models'] / max(report['model_security']['total_models'], 1)
        model_penalty = (1 - model_coverage) * 20
        
        final_score = max(0, base_score - resolution_penalty - threat_volume_penalty - model_penalty)
        return int(final_score)
    
    def _calculate_threat_trend(self, report: Dict) -> str:
        """Calculate threat trend direction"""
        # This would compare with historical data
        # For now, return based on current metrics
        total_threats = report['executive_summary']['total_threats']
        
        if total_threats > 50:
            return "Increasing"
        elif total_threats > 20:
            return "Stable"
        else:
            return "Decreasing"
    
    def _assess_risk_level(self, report: Dict) -> str:
        """Assess current risk level"""
        score = self._calculate_security_posture_score(report)
        
        if score >= 80:
            return "Low"
        elif score >= 60:
            return "Medium"
        elif score >= 40:
            return "High"
        else:
            return "Critical"
    
    def _identify_critical_issues(self, report: Dict) -> List[str]:
        """Identify critical security issues"""
        issues = []
        
        if report['executive_summary']['resolution_rate_percent'] < 50:
            issues.append("Low threat resolution rate")
        
        if report['executive_summary']['total_threats'] > 100:
            issues.append("High threat volume")
        
        # Check for critical threats in top threats
        for threat_type, data in report['threat_analysis']['top_threats']:
            if 'critical' in data.get('by_severity', {}):
                issues.append(f"Critical {threat_type} threats detected")
        
        return issues
    
    def _generate_strategic_recommendations(self, report: Dict) -> List[str]:
        """Generate strategic recommendations for executives"""
        recommendations = []
        
        score = self._calculate_security_posture_score(report)
        
        if score < 70:
            recommendations.append("Invest in additional security monitoring and response capabilities")
        
        if report['executive_summary']['total_threats'] > 50:
            recommendations.append("Consider implementing automated threat response systems")
        
        if report['model_security']['threats_per_model'] > 5:
            recommendations.append("Review and strengthen individual model security configurations")
        
        recommendations.append("Regular security training for development teams")
        recommendations.append("Establish quarterly security review meetings")
        
        return recommendations
    
    async def _analyze_temporal_patterns(self, organization_id: str, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Analyze temporal patterns in security events"""
        # Implementation would analyze time-based patterns
        return {"analysis": "temporal patterns analysis"}
    
    async def _analyze_model_interactions(self, organization_id: str, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Analyze model interaction patterns"""
        # Implementation would analyze model usage patterns
        return {"analysis": "model interactions analysis"}
    
    async def _analyze_user_behavior(self, organization_id: str, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Analyze user behavior patterns"""
        # Implementation would analyze user activity patterns
        return {"analysis": "user behavior analysis"}
    
    async def _analyze_attack_vectors(self, organization_id: str, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Analyze attack vectors and methods"""
        # Implementation would analyze attack patterns
        return {"analysis": "attack vectors analysis"}