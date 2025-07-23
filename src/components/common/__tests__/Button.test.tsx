import { fireEvent, render, screen } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('正常にレンダリングされること', () => {
    render(<Button>テストボタン</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('テストボタン')).toBeInTheDocument();
  });

  it('クリックイベントが正しく発火すること', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>テストボタン</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disabled状態の時にクリックイベントが発火しないこと', () => {
    const handleClick = jest.fn();
    render(
      <Button onClick={handleClick} disabled>
        テストボタン
      </Button>,
    );

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('variant propsが正しく適用されること', () => {
    const { rerender } = render(<Button variant="primary">プライマリ</Button>);
    expect(screen.getByRole('button')).toHaveClass('primary');

    rerender(<Button variant="secondary">セカンダリ</Button>);
    expect(screen.getByRole('button')).toHaveClass('secondary');

    rerender(<Button variant="outline">アウトライン</Button>);
    expect(screen.getByRole('button')).toHaveClass('outline');
  });

  it('size propsが正しく適用されること', () => {
    const { rerender } = render(<Button size="small">小さい</Button>);
    expect(screen.getByRole('button')).toHaveClass('small');

    rerender(<Button size="medium">中</Button>);
    expect(screen.getByRole('button')).toHaveClass('medium');

    rerender(<Button size="large">大きい</Button>);
    expect(screen.getByRole('button')).toHaveClass('large');
  });

  it('type propsが正しく適用されること', () => {
    const { rerender } = render(<Button type="submit">送信</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');

    rerender(<Button type="reset">リセット</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'reset');
  });
});
