/**
 * Dashboard Screen for OmnisecAI Mobile
 * Main overview screen showing security metrics and recent activity
 */
import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDashboardStore } from '@/store/dashboardStore';
import { useAuthStore } from '@/store/authStore';
import { COLORS, TYPOGRAPHY, LAYOUT, SEVERITY_COLORS, SCREENS } from '@/constants';
import { BaseScreenProps, SecurityMetrics } from '@/types';

const { width } = Dimensions.get('window');
const cardWidth = (width - LAYOUT.PADDING.LG * 3) / 2;

interface DashboardScreenProps extends BaseScreenProps {}

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  color: string;
  onPress?: () => void;
}

interface ThreatSummaryProps {
  threats: SecurityMetrics['threats'];
  onPress?: () => void;
}

function MetricCard({ title, value, subtitle, icon, color, onPress }: MetricCardProps) {
  return (
    <TouchableOpacity
      style={[styles.metricCard, { width: cardWidth }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.metricHeader}>
        <Icon name={icon} size={24} color={color} />
        <Text style={styles.metricTitle}>{title}</Text>
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
    </TouchableOpacity>
  );
}

function ThreatSummary({ threats, onPress }: ThreatSummaryProps) {
  const getThreatColor = (count: number) => {
    if (count === 0) return COLORS.green[500];
    if (count <= 5) return COLORS.yellow[500];
    return COLORS.red[500];
  };

  return (
    <TouchableOpacity style={styles.threatSummary} onPress={onPress}>
      <View style={styles.threatHeader}>
        <Icon name="shield-alert" size={24} color={COLORS.red[500]} />
        <Text style={styles.threatTitle}>Threat Overview</Text>
        <Icon name="chevron-right" size={20} color={COLORS.gray[400]} />
      </View>
      
      <View style={styles.threatMetrics}>
        <View style={styles.threatMetric}>
          <Text style={styles.threatCount}>{threats.total}</Text>
          <Text style={styles.threatLabel}>Total</Text>
        </View>
        <View style={styles.threatMetric}>
          <Text style={[styles.threatCount, { color: getThreatColor(threats.active) }]}>
            {threats.active}
          </Text>
          <Text style={styles.threatLabel}>Active</Text>
        </View>
        <View style={styles.threatMetric}>
          <Text style={styles.threatCount}>{threats.detections24h}</Text>
          <Text style={styles.threatLabel}>24h</Text>
        </View>
      </View>

      <View style={styles.severityBreakdown}>
        {threats.summary.map((item) => (
          <View key={item.severity} style={styles.severityItem}>
            <View
              style={[
                styles.severityDot,
                { backgroundColor: SEVERITY_COLORS[item.severity as keyof typeof SEVERITY_COLORS] }
              ]}
            />
            <Text style={styles.severityText}>
              {item.severity.charAt(0).toUpperCase() + item.severity.slice(1)}: {item.count}
            </Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

export default function DashboardScreen({ navigation }: DashboardScreenProps) {
  const { user } = useAuthStore();
  const {
    metrics,
    isLoading,
    isRefreshing,
    error,
    lastRefresh,
    fetchMetrics,
    refreshDashboard,
    clearError,
  } = useDashboardStore();

  useEffect(() => {
    // Fetch initial data
    fetchMetrics();
  }, []);

  const handleRefresh = useCallback(() => {
    refreshDashboard();
  }, []);

  const handleThreatPress = () => {
    navigation.navigate(SCREENS.THREATS);
  };

  const handleModelPress = () => {
    navigation.navigate(SCREENS.MODELS);
  };

  const handleScanPress = () => {
    navigation.navigate(SCREENS.SCANS);
  };

  const handleNotificationPress = () => {
    navigation.navigate(SCREENS.NOTIFICATIONS);
  };

  const handleError = () => {
    Alert.alert(
      'Error',
      error || 'Failed to load dashboard data',
      [
        { text: 'Retry', onPress: fetchMetrics },
        { text: 'Dismiss', onPress: clearError },
      ]
    );
  };

  useEffect(() => {
    if (error && !isLoading) {
      handleError();
    }
  }, [error, isLoading]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>
            {getGreeting()}, {user?.firstName || 'User'}
          </Text>
          <Text style={styles.subtitle}>
            {lastRefresh 
              ? `Last updated: ${lastRefresh.toLocaleTimeString()}`
              : 'Welcome to OmnisecAI'
            }
          </Text>
        </View>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={handleNotificationPress}
        >
          <Icon name="bell-outline" size={24} color={COLORS.gray[600]} />
          {/* Add badge for unread notifications */}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary[600]]}
            tintColor={COLORS.primary[600]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {metrics ? (
          <>
            {/* Threat Summary */}
            <ThreatSummary
              threats={metrics.threats}
              onPress={handleThreatPress}
            />

            {/* Metric Cards */}
            <View style={styles.metricsGrid}>
              <MetricCard
                title="Protected Models"
                value={metrics.models.active}
                subtitle={`${metrics.models.total} total`}
                icon="brain"
                color={COLORS.primary[600]}
                onPress={handleModelPress}
              />
              <MetricCard
                title="Security Events"
                value={metrics.activity.securityEvents24h}
                subtitle="Last 24 hours"
                icon="security"
                color={COLORS.green[600]}
              />
              <MetricCard
                title="Audit Logs"
                value={metrics.activity.auditLogs24h}
                subtitle="Last 24 hours"
                icon="file-document-outline"
                color={COLORS.yellow[600]}
              />
              <MetricCard
                title="System Health"
                value="98%"
                subtitle="All systems operational"
                icon="heart-pulse"
                color={COLORS.green[600]}
              />
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              
              <View style={styles.actionGrid}>
                <TouchableOpacity
                  style={styles.actionCard}
                  onPress={handleScanPress}
                >
                  <Icon name="radar" size={32} color={COLORS.primary[600]} />
                  <Text style={styles.actionTitle}>Run Scan</Text>
                  <Text style={styles.actionSubtitle}>Security analysis</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionCard}
                  onPress={handleModelPress}
                >
                  <Icon name="upload" size={32} color={COLORS.green[600]} />
                  <Text style={styles.actionTitle}>Upload Model</Text>
                  <Text style={styles.actionSubtitle}>Add new AI model</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionCard}
                  onPress={handleThreatPress}
                >
                  <Icon name="shield-search" size={32} color={COLORS.red[600]} />
                  <Text style={styles.actionTitle}>View Threats</Text>
                  <Text style={styles.actionSubtitle}>Active threats</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionCard}>
                  <Icon name="chart-line" size={32} color={COLORS.yellow[600]} />
                  <Text style={styles.actionTitle}>Analytics</Text>
                  <Text style={styles.actionSubtitle}>Security reports</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : isLoading ? (
          <View style={styles.loadingContainer}>
            <Icon name="loading" size={48} color={COLORS.primary[600]} />
            <Text style={styles.loadingText}>Loading dashboard...</Text>
          </View>
        ) : (
          <View style={styles.errorContainer}>
            <Icon name="alert-circle" size={48} color={COLORS.red[500]} />
            <Text style={styles.errorTitle}>Unable to load dashboard</Text>
            <Text style={styles.errorText}>
              Please check your connection and try again
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchMetrics}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: LAYOUT.PADDING.LG,
    paddingTop: LAYOUT.PADDING.MD,
    paddingBottom: LAYOUT.PADDING.LG,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.gray[900],
    marginBottom: 4,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.gray[600],
  },
  notificationButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: LAYOUT.PADDING.LG,
    paddingVertical: LAYOUT.PADDING.MD,
  },
  threatSummary: {
    backgroundColor: 'white',
    borderRadius: LAYOUT.BORDER_RADIUS.LG,
    padding: LAYOUT.PADDING.LG,
    marginBottom: LAYOUT.PADDING.LG,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  threatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: LAYOUT.PADDING.MD,
  },
  threatTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.gray[900],
    flex: 1,
    marginLeft: 8,
  },
  threatMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: LAYOUT.PADDING.MD,
  },
  threatMetric: {
    alignItems: 'center',
  },
  threatCount: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XXL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD as any,
    color: COLORS.gray[900],
  },
  threatLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.gray[600],
    marginTop: 4,
  },
  severityBreakdown: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: LAYOUT.PADDING.SM,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  severityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: LAYOUT.PADDING.MD,
    marginBottom: 4,
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  severityText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    color: COLORS.gray[600],
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: LAYOUT.PADDING.LG,
  },
  metricCard: {
    backgroundColor: 'white',
    borderRadius: LAYOUT.BORDER_RADIUS.LG,
    padding: LAYOUT.PADDING.MD,
    marginBottom: LAYOUT.PADDING.MD,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: LAYOUT.PADDING.SM,
  },
  metricTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
    color: COLORS.gray[600],
    marginLeft: 8,
  },
  metricValue: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD as any,
    color: COLORS.gray[900],
    marginBottom: 2,
  },
  metricSubtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    color: COLORS.gray[500],
  },
  quickActions: {
    marginBottom: LAYOUT.PADDING.XL,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.gray[900],
    marginBottom: LAYOUT.PADDING.MD,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: 'white',
    borderRadius: LAYOUT.BORDER_RADIUS.LG,
    padding: LAYOUT.PADDING.LG,
    alignItems: 'center',
    width: cardWidth,
    marginBottom: LAYOUT.PADDING.MD,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MD,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.gray[900],
    marginTop: LAYOUT.PADDING.SM,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    color: COLORS.gray[600],
    textAlign: 'center',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MD,
    color: COLORS.gray[600],
    marginTop: LAYOUT.PADDING.MD,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: LAYOUT.PADDING.LG,
  },
  errorTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.gray[900],
    textAlign: 'center',
    marginTop: LAYOUT.PADDING.MD,
  },
  errorText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MD,
    color: COLORS.gray[600],
    textAlign: 'center',
    marginTop: LAYOUT.PADDING.SM,
    marginBottom: LAYOUT.PADDING.LG,
  },
  retryButton: {
    backgroundColor: COLORS.primary[600],
    borderRadius: LAYOUT.BORDER_RADIUS.MD,
    paddingHorizontal: LAYOUT.PADDING.LG,
    paddingVertical: LAYOUT.PADDING.SM,
  },
  retryButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MD,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: 'white',
  },
});