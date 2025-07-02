import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import asyncio
import json

from ..config.database import get_db_connection, get_mongo_connection

logger = logging.getLogger(__name__)

class ThreatAnalyzer:
    """AI Security Threat Analysis Engine"""
    
    def __init__(self):
        self.pg_pool = None
        self.mongo_db = None
        self.threat_patterns = {}
        self.ml_models = {}
    
    async def initialize(self):
        """Initialize the threat analyzer"""
        try:
            self.pg_pool = await get_db_connection()
            self.mongo_db = await get_mongo_connection()
            
            # Load threat patterns
            await self._load_threat_patterns()
            
            logger.info("Threat analyzer initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize threat analyzer: {e}")
            raise
    
    async def cleanup(self):
        """Cleanup resources"""
        logger.info("Threat analyzer cleanup completed")
    
    async def _load_threat_patterns(self):
        """Load known threat patterns"""
        self.threat_patterns = {
            'adversarial_attacks': {
                'indicators': ['unusual_input_patterns', 'gradient_manipulation', 'noise_injection'],
                'severity': 'high',
                'confidence_threshold': 0.8
            },
            'model_poisoning': {
                'indicators': ['training_data_anomalies', 'weight_manipulation', 'backdoor_triggers'],
                'severity': 'critical',
                'confidence_threshold': 0.9
            },
            'data_extraction': {
                'indicators': ['membership_inference', 'model_inversion', 'property_inference'],
                'severity': 'medium',
                'confidence_threshold': 0.7
            },
            'model_stealing': {
                'indicators': ['query_pattern_analysis', 'surrogate_model_training', 'api_abuse'],
                'severity': 'medium',
                'confidence_threshold': 0.75
            }
        }
    
    async def analyze_threats(self, organization_id: str, days: int = 7, severity: Optional[str] = None) -> Dict[str, Any]:
        """Analyze threats for an organization"""
        try:
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=days)
            
            # Get threat data from MongoDB
            mongo_filter = {
                'organization_id': organization_id,
                'timestamp': {
                    '$gte': start_date,
                    '$lte': end_date
                }
            }
            
            if severity:
                mongo_filter['severity'] = severity
            
            threats_cursor = self.mongo_db.threat_detection_logs.find(mongo_filter)
            threats = await threats_cursor.to_list(None)
            
            # Get security threats from PostgreSQL
            async with self.pg_pool.acquire() as conn:
                pg_query = """
                    SELECT threat_type, severity, COUNT(*) as count, 
                           AVG(CASE WHEN is_resolved THEN 1 ELSE 0 END) as resolution_rate
                    FROM security_threats 
                    WHERE organization_id = $1 
                    AND created_at >= $2 AND created_at <= $3
                """
                if severity:
                    pg_query += " AND severity = $4 GROUP BY threat_type, severity"
                    pg_threats = await conn.fetch(pg_query, organization_id, start_date, end_date, severity)
                else:
                    pg_query += " GROUP BY threat_type, severity"
                    pg_threats = await conn.fetch(pg_query, organization_id, start_date, end_date)
            
            # Analyze patterns
            threat_analytics = {
                'summary': {
                    'total_threats': len(threats),
                    'unique_threat_types': len(set(t.get('threat_type') for t in threats)),
                    'avg_severity_score': self._calculate_severity_score(threats),
                    'detection_rate': self._calculate_detection_rate(threats),
                    'false_positive_rate': self._calculate_false_positive_rate(threats)
                },
                'threat_distribution': self._analyze_threat_distribution(threats),
                'temporal_patterns': self._analyze_temporal_patterns(threats),
                'model_vulnerabilities': await self._analyze_model_vulnerabilities(organization_id, threats),
                'recommendations': self._generate_recommendations(threats),
                'trends': self._analyze_trends(pg_threats)
            }
            
            return threat_analytics
            
        except Exception as e:
            logger.error(f"Threat analysis failed: {e}")
            raise
    
    async def analyze_model_security(self, organization_id: str, model_id: Optional[str] = None) -> Dict[str, Any]:
        """Analyze security for specific models"""
        try:
            # Get model data
            async with self.pg_pool.acquire() as conn:
                if model_id:
                    models_query = "SELECT * FROM ai_models WHERE organization_id = $1 AND id = $2"
                    models = await conn.fetch(models_query, organization_id, model_id)
                else:
                    models_query = "SELECT * FROM ai_models WHERE organization_id = $1"
                    models = await conn.fetch(models_query, organization_id)
            
            model_security = {}
            
            for model in models:
                model_id_str = str(model['id'])
                
                # Get threats for this model
                threats_cursor = self.mongo_db.threat_detection_logs.find({
                    'organization_id': organization_id,
                    'model_id': model_id_str
                })
                model_threats = await threats_cursor.to_list(None)
                
                # Get interactions for this model
                interactions_cursor = self.mongo_db.model_interactions.find({
                    'organization_id': organization_id,
                    'model_id': model_id_str
                })
                interactions = await interactions_cursor.to_list(None)
                
                model_security[model_id_str] = {
                    'model_info': {
                        'name': model['name'],
                        'type': model['type'],
                        'version': model['version']
                    },
                    'security_score': self._calculate_model_security_score(model_threats, interactions),
                    'vulnerability_assessment': self._assess_vulnerabilities(model, model_threats),
                    'threat_exposure': self._calculate_threat_exposure(model_threats),
                    'interaction_patterns': self._analyze_interaction_patterns(interactions),
                    'recommendations': self._generate_model_recommendations(model, model_threats)
                }
            
            return model_security
            
        except Exception as e:
            logger.error(f"Model security analysis failed: {e}")
            raise
    
    async def analyze_model(self, organization_id: str, model_id: str, analysis_type: str = "full") -> Dict[str, Any]:
        """Perform deep analysis on a specific model"""
        try:
            # This would integrate with actual ML security analysis tools
            # For now, returning a simulated analysis
            
            analysis_result = {
                'model_id': model_id,
                'analysis_type': analysis_type,
                'timestamp': datetime.utcnow().isoformat(),
                'security_assessment': {
                    'overall_score': 75,  # 0-100 scale
                    'vulnerabilities_found': 3,
                    'critical_issues': 0,
                    'high_issues': 1,
                    'medium_issues': 2,
                    'low_issues': 0
                },
                'detailed_findings': [
                    {
                        'type': 'adversarial_vulnerability',
                        'severity': 'high',
                        'confidence': 0.85,
                        'description': 'Model shows sensitivity to adversarial perturbations',
                        'recommendation': 'Implement adversarial training or input preprocessing'
                    },
                    {
                        'type': 'data_leakage',
                        'severity': 'medium',
                        'confidence': 0.72,
                        'description': 'Potential memorization of training data detected',
                        'recommendation': 'Apply differential privacy techniques'
                    }
                ],
                'performance_impact': {
                    'latency_ms': 150,
                    'memory_usage_mb': 512,
                    'cpu_utilization': 45
                }
            }
            
            # Store analysis result
            await self._store_analysis_result(organization_id, model_id, analysis_result)
            
            return analysis_result
            
        except Exception as e:
            logger.error(f"Model analysis failed: {e}")
            raise
    
    def _calculate_severity_score(self, threats: List[Dict]) -> float:
        """Calculate average severity score"""
        if not threats:
            return 0.0
        
        severity_values = {'critical': 4, 'high': 3, 'medium': 2, 'low': 1}
        total_score = sum(severity_values.get(t.get('severity', 'low'), 1) for t in threats)
        return total_score / len(threats)
    
    def _calculate_detection_rate(self, threats: List[Dict]) -> float:
        """Calculate threat detection rate"""
        if not threats:
            return 0.0
        
        detected = sum(1 for t in threats if not t.get('false_positive', False))
        return detected / len(threats)
    
    def _calculate_false_positive_rate(self, threats: List[Dict]) -> float:
        """Calculate false positive rate"""
        if not threats:
            return 0.0
        
        false_positives = sum(1 for t in threats if t.get('false_positive', False))
        return false_positives / len(threats)
    
    def _analyze_threat_distribution(self, threats: List[Dict]) -> Dict[str, int]:
        """Analyze distribution of threat types"""
        distribution = {}
        for threat in threats:
            threat_type = threat.get('threat_type', 'unknown')
            distribution[threat_type] = distribution.get(threat_type, 0) + 1
        return distribution
    
    def _analyze_temporal_patterns(self, threats: List[Dict]) -> Dict[str, Any]:
        """Analyze temporal patterns in threats"""
        if not threats:
            return {}
        
        # Group by hour of day
        hourly_distribution = {}
        for threat in threats:
            timestamp = threat.get('timestamp')
            if timestamp:
                hour = timestamp.hour
                hourly_distribution[hour] = hourly_distribution.get(hour, 0) + 1
        
        return {
            'hourly_distribution': hourly_distribution,
            'peak_hours': sorted(hourly_distribution.items(), key=lambda x: x[1], reverse=True)[:3]
        }
    
    async def _analyze_model_vulnerabilities(self, organization_id: str, threats: List[Dict]) -> Dict[str, Any]:
        """Analyze model-specific vulnerabilities"""
        model_threats = {}
        for threat in threats:
            model_id = threat.get('model_id')
            if model_id:
                if model_id not in model_threats:
                    model_threats[model_id] = []
                model_threats[model_id].append(threat)
        
        vulnerabilities = {}
        for model_id, model_threat_list in model_threats.items():
            vulnerabilities[model_id] = {
                'threat_count': len(model_threat_list),
                'unique_threat_types': len(set(t.get('threat_type') for t in model_threat_list)),
                'avg_severity': self._calculate_severity_score(model_threat_list)
            }
        
        return vulnerabilities
    
    def _generate_recommendations(self, threats: List[Dict]) -> List[str]:
        """Generate security recommendations"""
        recommendations = []
        
        threat_types = set(t.get('threat_type') for t in threats)
        
        if 'adversarial_attack' in threat_types:
            recommendations.append("Implement adversarial training to improve model robustness")
        
        if 'data_extraction' in threat_types:
            recommendations.append("Apply differential privacy techniques to protect training data")
        
        if 'model_poisoning' in threat_types:
            recommendations.append("Implement model integrity verification and anomaly detection")
        
        if len(threats) > 10:
            recommendations.append("Consider implementing automated threat response mechanisms")
        
        return recommendations
    
    def _analyze_trends(self, pg_threats: List) -> Dict[str, Any]:
        """Analyze threat trends from PostgreSQL data"""
        trends = {}
        for threat in pg_threats:
            threat_type = threat['threat_type']
            if threat_type not in trends:
                trends[threat_type] = {
                    'count': 0,
                    'resolution_rate': 0
                }
            trends[threat_type]['count'] += threat['count']
            trends[threat_type]['resolution_rate'] = threat['resolution_rate']
        
        return trends
    
    def _calculate_model_security_score(self, threats: List[Dict], interactions: List[Dict]) -> int:
        """Calculate security score for a model (0-100)"""
        base_score = 100
        
        # Deduct points for threats
        threat_penalty = len(threats) * 5
        severity_penalty = sum(
            {'critical': 20, 'high': 15, 'medium': 10, 'low': 5}.get(t.get('severity', 'low'), 5)
            for t in threats
        )
        
        # Consider interaction patterns
        interaction_penalty = 0
        if len(interactions) > 1000:  # High usage might indicate higher exposure
            interaction_penalty = 10
        
        final_score = max(0, base_score - threat_penalty - severity_penalty - interaction_penalty)
        return final_score
    
    def _assess_vulnerabilities(self, model: Dict, threats: List[Dict]) -> Dict[str, Any]:
        """Assess model vulnerabilities"""
        return {
            'model_type_risks': self._get_model_type_risks(model['type']),
            'threat_exposure': len(threats),
            'critical_vulnerabilities': len([t for t in threats if t.get('severity') == 'critical']),
            'recent_attacks': len([t for t in threats if (datetime.utcnow() - t.get('timestamp', datetime.min)).days <= 7])
        }
    
    def _get_model_type_risks(self, model_type: str) -> List[str]:
        """Get known risks for model type"""
        risks = {
            'tensorflow': ['adversarial_attacks', 'model_extraction'],
            'pytorch': ['gradient_attacks', 'inference_attacks'],
            'onnx': ['format_vulnerabilities', 'serialization_attacks'],
            'huggingface': ['prompt_injection', 'data_extraction']
        }
        return risks.get(model_type, ['unknown_risks'])
    
    def _calculate_threat_exposure(self, threats: List[Dict]) -> Dict[str, int]:
        """Calculate threat exposure metrics"""
        exposure = {
            'total': len(threats),
            'last_24h': len([t for t in threats if (datetime.utcnow() - t.get('timestamp', datetime.min)).hours <= 24]),
            'last_7d': len([t for t in threats if (datetime.utcnow() - t.get('timestamp', datetime.min)).days <= 7]),
            'last_30d': len([t for t in threats if (datetime.utcnow() - t.get('timestamp', datetime.min)).days <= 30])
        }
        return exposure
    
    def _analyze_interaction_patterns(self, interactions: List[Dict]) -> Dict[str, Any]:
        """Analyze model interaction patterns"""
        if not interactions:
            return {}
        
        return {
            'total_interactions': len(interactions),
            'unique_users': len(set(i.get('user_id') for i in interactions if i.get('user_id'))),
            'interaction_types': self._analyze_threat_distribution(interactions),
            'avg_duration': sum(i.get('duration_ms', 0) for i in interactions) / len(interactions)
        }
    
    def _generate_model_recommendations(self, model: Dict, threats: List[Dict]) -> List[str]:
        """Generate model-specific recommendations"""
        recommendations = []
        
        if len(threats) > 5:
            recommendations.append(f"Model {model['name']} shows high threat activity - consider additional monitoring")
        
        if model['type'] in ['huggingface', 'pytorch']:
            recommendations.append("Implement input validation and sanitization for language models")
        
        critical_threats = [t for t in threats if t.get('severity') == 'critical']
        if critical_threats:
            recommendations.append("Address critical vulnerabilities immediately")
        
        return recommendations
    
    async def _store_analysis_result(self, organization_id: str, model_id: str, result: Dict[str, Any]):
        """Store analysis result in database"""
        try:
            # Store in MongoDB for detailed logs
            await self.mongo_db.model_analysis_results.insert_one({
                'organization_id': organization_id,
                'model_id': model_id,
                'timestamp': datetime.utcnow(),
                'result': result
            })
            
            # Store summary in PostgreSQL
            async with self.pg_pool.acquire() as conn:
                await conn.execute("""
                    INSERT INTO llm_test_results 
                    (organization_id, model_id, test_type, status, metrics, completed_at)
                    VALUES ($1, $2, $3, $4, $5, $6)
                """, 
                organization_id, 
                model_id, 
                result['analysis_type'],
                'completed',
                json.dumps(result['security_assessment']),
                datetime.utcnow()
                )
                
        except Exception as e:
            logger.error(f"Failed to store analysis result: {e}")
            # Don't raise - this is not critical for the analysis