import {
  render,
  screen,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TableEditor from './TableEditor';

describe('Testing Table Editor', () => {
  test('Number of Rows', () => {
    render(<TableEditor />);

    screen.getByText(
      'Number of Rows',
      { exact: false }
    );
  });

  test('Shortcut Keys:', () => {
    render(<TableEditor />);

    screen.getByText(
      'Shortcut Keys:',
      { exact: false }
    );
  });
});
