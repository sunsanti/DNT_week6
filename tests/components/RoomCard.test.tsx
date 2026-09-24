import { render } from '@testing-library/react-native';
import { RoomCard } from '@/components/RoomCard';
import type { Room } from '@/types';

const baseRoom: Room = {
  id: '1',
  name: 'Lab A3-101',
  building: 'Building A3',
  location: 'Building A3',
  capacity: 30,
  seatsLeft: 30,
  floor: 1,
  amenities: [],
  photoUrl: null,
  status: 'available',
  type: 'lab',
};

describe('<RoomCard />', () => {
  it('renders the Available badge for an available room', async () => {
    const { getByText } = await render(<RoomCard room={baseRoom} onPress={() => {}} />);
    expect(getByText('Available')).toBeTruthy();
    expect(getByText('Lab A3-101')).toBeTruthy();
    expect(getByText('30/30 seats')).toBeTruthy();
  });

  it('renders the Occupied badge for an occupied room', async () => {
    const { getByText } = await render(
      <RoomCard room={{ ...baseRoom, status: 'occupied' }} onPress={() => {}} />,
    );
    expect(getByText('Occupied')).toBeTruthy();
  });
});
