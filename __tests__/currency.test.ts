import { truncateDigits } from '../src/utils/currency';

describe('truncateDigits', () => {
  it('8자리 이하면 그대로 반환', () => {
    expect(truncateDigits('12,345,678', 8)).toBe('12,345,678');
  });

  it('8자리 넘으면 8자리까지 자르고 ... 붙임', () => {
    expect(truncateDigits('123,456,789', 8)).toBe('123,456,78...');
  });

  it('부호는 자릿수에 포함 안 됨', () => {
    expect(truncateDigits('+123,456,789', 8)).toBe('+123,456,78...');
  });

  it('숫자가 하나도 없으면 그대로 반환', () => {
    expect(truncateDigits('', 8)).toBe('');
  });
});
