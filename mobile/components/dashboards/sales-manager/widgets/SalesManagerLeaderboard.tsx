import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface LeaderboardEntry {
  id: string;
  name: string;
  image?: string;
  svCompleted: number;
  bookings: number;
  activeNegotiations: number;
  score: number | string;
}

interface SalesManagerLeaderboardProps {
  leaderboardData?: LeaderboardEntry[];
  currentUserId?: string;
}

export default function SalesManagerLeaderboard({ leaderboardData, currentUserId }: SalesManagerLeaderboardProps) {
  const router = useRouter();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.iconContainer}>
            <Feather name="award" size={20} color="#eab308" />
          </View>
          <Text style={styles.title}>Team Leaderboard</Text>
        </View>
      </View>

      {!leaderboardData || leaderboardData.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No data available</Text>
        </View>
      ) : (
        <View style={styles.list}>
          <View style={styles.headerRow}>
            <Text style={[styles.headerText, { width: 40, textAlign: 'center' }]}>RANK</Text>
            <Text style={[styles.headerText, { flex: 1, paddingLeft: 8 }]}>AGENT</Text>
            <Text style={[styles.headerText, { width: 32, textAlign: 'right' }]}>SVs</Text>
            <Text style={[styles.headerText, { width: 50, textAlign: 'right' }]}>BOOK</Text>
            <Text style={[styles.headerText, { width: 45, textAlign: 'right' }]}>SCORE</Text>
          </View>
          {leaderboardData.map((entry, index) => {
            const isMe = entry.id === currentUserId;
            const rankEmoji = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`;
            
            return (
              <View key={entry.id} style={[styles.entryRow, isMe && styles.isMeRow]}>
                <View style={styles.rankBox}>
                  <Text style={[styles.rankText, index === 0 && styles.rank1, index === 1 && styles.rank2, index === 2 && styles.rank3]}>
                    {rankEmoji}
                  </Text>
                </View>
                
                <View style={styles.entryInfo}>
                  <View style={styles.avatar}>
                    {entry.image ? (
                       <View style={styles.avatar} /> // In a real app we'd use Image, but using placeholder View for simple parity
                    ) : (
                      <Text style={styles.avatarText}>{entry.name.charAt(0).toUpperCase()}</Text>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.entryName, isMe && styles.isMeText]} numberOfLines={1}>
                      {entry.name} {isMe && <Text style={styles.youBadge}>(You)</Text>}
                    </Text>
                  </View>
                </View>

                <View style={styles.statsRow}>
                  <View style={styles.statBoxSlim}>
                    <Text style={styles.statValueSlim}>{entry.svCompleted || 0}</Text>
                  </View>
                  <View style={styles.statBoxSlim}>
                    <Text style={styles.statValueSlim}>{entry.bookings || 0}</Text>
                  </View>
                  <View style={styles.statBoxScore}>
                    <Text style={[styles.statValueScore, isMe && { color: '#4f46e5' }]}>{entry.score || 0}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#fef9c3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  list: {
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    marginBottom: 4,
  },
  headerText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#94a3b8',
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 12,
  },
  isMeRow: {
    backgroundColor: '#eef2ff',
    borderColor: '#e0e7ff',
    borderWidth: 1,
  },
  rankBox: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#475569',
  },
  rank1: { fontSize: 20 },
  rank2: { fontSize: 20 },
  rank3: { fontSize: 20 },
  entryInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
    gap: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748b',
  },
  entryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  isMeText: {
    color: '#4338ca',
    fontWeight: 'bold',
  },
  youBadge: {
    fontSize: 11,
    color: '#6366f1',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  statBoxSlim: {
    width: 32,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  statBoxScore: {
    width: 45,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  statValueSlim: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  statValueScore: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
});
