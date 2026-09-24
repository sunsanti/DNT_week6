import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { MyBookingsStackParamList } from './types';
import { MyBookingsListScreen } from '@/screens/my-bookings/MyBookingsListScreen';
import { BookingDetailScreen } from '@/screens/my-bookings/BookingDetailScreen';
import { fonts } from '@/constants/theme';

const Stack = createNativeStackNavigator<MyBookingsStackParamList>();

export function MyBookingsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerTitleStyle: { fontFamily: fonts.semibold } }}>
      <Stack.Screen
        name="MyBookingsList"
        component={MyBookingsListScreen}
        options={{ title: 'My Bookings' }}
      />
      <Stack.Screen
        name="BookingDetail"
        component={BookingDetailScreen}
        options={{ title: 'Booking Detail' }}
      />
    </Stack.Navigator>
  );
}
