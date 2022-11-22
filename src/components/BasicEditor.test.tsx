import {
  render,
  screen,
} from '@testing-library/react';
import BasicEditor from './BasicEditor';

describe('Testing Basic Editor', () => {
  test('Try the editor', () => {
    render(<BasicEditor />);

    screen.getByText(
      'Enter some rich text…',
      { exact: false }
    );
  });
});
