import { fireEvent, render, screen } from '@testing-library/react';
import { Modal } from '../Modal';

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    children: <div>モーダルの内容</div>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('isOpenがtrueの時に正常にレンダリングされること', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByText('モーダルの内容')).toBeInTheDocument();
  });

  it('isOpenがfalseの時にレンダリングされないこと', () => {
    render(<Modal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('モーダルの内容')).not.toBeInTheDocument();
  });

  it('titleが正しく表示されること', () => {
    render(<Modal {...defaultProps} title="テストタイトル" />);
    expect(screen.getByText('テストタイトル')).toBeInTheDocument();
  });

  it('閉じるボタンクリックでonCloseが呼ばれること', () => {
    render(<Modal {...defaultProps} />);

    const closeButton = screen.getByLabelText('モーダルを閉じる');
    fireEvent.click(closeButton);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('オーバーレイクリックでonCloseが呼ばれること', () => {
    render(<Modal {...defaultProps} />);

    const overlay = screen.getByText('モーダルの内容').closest('.overlay') as HTMLElement;
    fireEvent.click(overlay);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('モーダル内容クリックでonCloseが呼ばれないこと', () => {
    render(<Modal {...defaultProps} />);

    const modalContent = screen.getByText('モーダルの内容');
    fireEvent.click(modalContent);

    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('Escapeキー押下でonCloseが呼ばれること', () => {
    render(<Modal {...defaultProps} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });
});
