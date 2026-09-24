import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { BrowseRoomsStackParamList } from './types';
import { RoomListScreen } from '@/screens/browse-rooms/RoomListScreen';
import { RoomDetailScreen } from '@/screens/browse-rooms/RoomDetailScreen';
import { TimeSlotBookingScreen } from '@/screens/browse-rooms/TimeSlotBookingScreen';
import { SeatSelectionScreen } from '@/screens/browse-rooms/SeatSelectionScreen';
import { fonts } from '@/constants/theme';

const Stack = createNativeStackNavigator<BrowseRoomsStackParamList>();

export function BrowseRoomsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerTitleStyle: { fontFamily: fonts.semibold } }}>
      <Stack.Screen
        name="RoomList"
        component={RoomListScreen}
        options={{ title: 'Browse Rooms' }}
      />
      <Stack.Screen
        name="RoomDetail"
        component={RoomDetailScreen}
        options={{ title: 'Room Detail' }}
      />
      <Stack.Screen
        name="TimeSlotBooking"
        component={TimeSlotBookingScreen}
        options={{ title: 'Book a Slot' }}
      />
      <Stack.Screen
        name="SeatSelection"
        component={SeatSelectionScreen}
        options={{ title: 'Pick Seats' }}
      />
    </Stack.Navigator>
  );
}
