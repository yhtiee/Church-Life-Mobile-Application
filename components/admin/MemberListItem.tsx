import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { useTheme } from '@/context/ThemeContext';
import { Parishioner } from '@/constants/mockData';
import { Image } from 'expo-image';

interface MemberListItemProps {
  item: Parishioner;
  onPress: () => void;
  onMessage: () => void;
  onSuspend: () => void;
}

export function MemberListItem({ item, onPress, onMessage, onSuspend }: MemberListItemProps) {
  const { colors, typography, radius } = useTheme();

  const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
    const trans = dragX.interpolate({
      inputRange: [-160, 0],
      outputRange: [0, 160],
    });

    return (
      <View style={styles.rightActions}>
        <Animated.View style={[styles.actionBtn, { backgroundColor: colors.primary, transform: [{ translateX: 0 }] }]}>
          <TouchableOpacity style={styles.actionBtnInner} onPress={onMessage}>
            <Ionicons name="chatbubble-ellipses-outline" size={20} color="#FFFFFF" />
            <Text style={[styles.actionText, { fontFamily: typography.fontFamily.semiBold }]}>Message</Text>
          </TouchableOpacity>
        </Animated.View>
        
        <Animated.View style={[styles.actionBtn, { backgroundColor: colors.danger, transform: [{ translateX: 0 }] }]}>
          <TouchableOpacity style={styles.actionBtnInner} onPress={onSuspend}>
            <Ionicons name="hand-right-outline" size={20} color="#FFFFFF" />
            <Text style={[styles.actionText, { fontFamily: typography.fontFamily.semiBold }]}>Suspend</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  return (
    <Swipeable renderRightActions={renderRightActions} friction={2} rightThreshold={40}>
      <TouchableOpacity 
        activeOpacity={0.7} 
        onPress={onPress}
        style={[styles.container, { backgroundColor: colors.surface, borderBottomColor: colors.divider }]}
      >
        <Image 
          source={item.avatar || 'https://via.placeholder.com/150'} 
          style={[styles.avatar, { borderRadius: 20, backgroundColor: colors.surfaceMuted }]} 
        />
        
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
            {item.fullName}
          </Text>
          <View style={styles.groupRow}>
            <Text style={[styles.group, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
              {item.groupId?.toUpperCase() || 'UNASSIGNED'}
            </Text>
            <View style={[styles.dot, { backgroundColor: colors.border }]} />
            <Text style={[styles.status, { color: item.status === 'Active' ? colors.success : item.status === 'Pending' ? colors.warning : colors.danger, fontFamily: typography.fontFamily.semiBold }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={16} color={colors.border} />
      </TouchableOpacity>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatar: {
    width: 40,
    height: 40,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
  },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  group: {
    fontSize: 11,
    letterSpacing: 0.5,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    marginHorizontal: 8,
  },
  status: {
    fontSize: 11,
  },
  rightActions: {
    flexDirection: 'row',
    width: 160,
  },
  actionBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnInner: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 10,
    marginTop: 4,
  },
});
