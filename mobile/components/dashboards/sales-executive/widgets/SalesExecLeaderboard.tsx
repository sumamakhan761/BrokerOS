import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LeaderboardEntry } from '../misc/types';

interface SalesExecLeaderboardProps {
  leaderboard: { leaderboard: LeaderboardEntry[]; currentUserId: string } | null;
}

export default function SalesExecLeaderboard({ leaderboard }: SalesExecLeaderboardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>🏆 Monthly Leaderboard</Text>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={[styles.lbHeader, { flex: 1, marginLeft: 8 }]}>Agent</Text>
          <Text style={[styles.lbHeader, { width: 50, textAlign: 'right' }]}>SVs</Text>
          <Text style={[styles.lbHeader, { width: 70, textAlign: 'right' }]}>Bookings</Text>
          <Text style={[styles.lbHeader, { width: 55, textAlign: 'right' }]}>Score</Text>
        </View>
        {leaderboard?.leaderboard.map((agent) => {
          const isMe = agent.userId === leaderboard.currentUserId;
          const rankEmoji = agent.rank === 1 ? '🥇' : agent.rank === 2 ? '🥈' : agent.rank === 3 ? '🥉' : `${agent.rank}`;
          const rowBg =
            agent.rank === 1 ? '#fffbeb' :
              agent.rank === 2 ? '#f8fafc' :
                agent.rank === 3 ? '#fff7ed' : 'transparent';
          return (
            <View key={agent.userId} style={[styles.row, {
              backgroundColor: isMe ? '#f0f9ff' : rowBg,
              borderWidth: isMe ? 1 : 0,
              borderColor: '#bae6fd',
            }]}>
              <Text style={styles.rankCell}>{rankEmoji}</Text>
              <Text style={[styles.nameCell, { fontWeight: isMe ? '700' : '500', color: isMe ? '#0284c7' : '#0f172a' }]} numberOfLines={1}>
                {agent.name || '—'}{isMe ? ' (You)' : ''}
              </Text>
              <Text style={[styles.statCell, { width: 50 }]}>{agent.siteVisits}</Text>
              <Text style={[styles.statCell, { width: 70 }]}>{agent.bookings}</Text>
              <Text style={styles.scoreCell}>{agent.score}</Text>
            </View>
          );
        })}
        {(!leaderboard?.leaderboard || leaderboard.leaderboard.length === 0) && (
          <Text style={styles.emptyText}>No activity on the leaderboard yet.</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 6,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  headerRow: {
    flexDirection: 'row',
    paddingHorizontal: 4,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    marginBottom: 8,
  },
  lbHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  rankCell: {
    width: 28,
    fontSize: 14,
    textAlign: 'center',
  },
  nameCell: {
    flex: 1,
    fontSize: 13,
  },
  statCell: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'right',
    fontWeight: '500',
  },
  scoreCell: {
    width: 55,
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'right',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 16,
  },
});
