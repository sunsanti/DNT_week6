import type { NavigatorScreenParams } from '@react-navigation/native';
import type { TimeSlot } from '@/types';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type BrowseRoomsStackParamList = {
  RoomList: undefined;
  RoomDetail: { roomId: string };
  TimeSlotBooking: { roomId: string };
  SeatSelection: { roomId: string; slot: TimeSlot };
};

export type MyBookingsStackParamList = {
  MyBookingsList: undefined;
  BookingDetail: { bookingId: string };
};

export type ProfileStackParamList = {
  Profile: undefined;
};

export type MainTabsParamList = {
  BrowseRoomsTab: NavigatorScreenParams<BrowseRoomsStackParamList>;
  MyBookingsTab: NavigatorScreenParams<MyBookingsStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};
