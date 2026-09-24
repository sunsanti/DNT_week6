import { render, fireEvent } from '@testing-library/react-native';
import { FilterChip } from '@/components/FilterChip';

describe('<FilterChip />', () => {
  it('calls onPress when tapped', async () => {
    const onPress = jest.fn();
    const { getByText } = await render(
      <FilterChip label="Building A3" selected={false} onPress={onPress} />,
    );

    fireEvent.press(getByText('Building A3'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('reflects the selected state via accessibility state', async () => {
    const { getByRole } = await render(
      <FilterChip label="Building A3" selected onPress={() => {}} />,
    );

    expect(getByRole('button').props.accessibilityState.selected).toBe(true);
  });
});
