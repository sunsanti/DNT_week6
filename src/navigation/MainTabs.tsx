import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Buildings, CalendarCheck, User } from 'phosphor-react-native';
import type { MainTabsParamList } from './types';
import { BrowseRoomsStack } from './BrowseRoomsStack';
import { MyBookingsStack } from './MyBookingsStack';
import { ProfileStack } from './ProfileStack';
import { useThemeColors } from '@/constants/theme';

const Tab = createBottomTabNavigator<MainTabsParamList>();

export function MainTabs() {
  const colors = useThemeColors();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
      }}
    >
      <Tab.Screen
        name="BrowseRoomsTab"
        component={BrowseRoomsStack}
        options={{
          title: 'Browse Rooms',
          tabBarIcon: ({ color, size }) => <Buildings size={size} color={color} weight="fill" />,
        }}
      />
      <Tab.Screen
        name="MyBookingsTab"
        component={MyBookingsStack}
        options={{
          title: 'My Bookings',
          tabBarIcon: ({ color, size }) => (
            <CalendarCheck size={size} color={color} weight="fill" />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} weight="fill" />,
        }}
      />
    </Tab.Navigator>
  );
}
