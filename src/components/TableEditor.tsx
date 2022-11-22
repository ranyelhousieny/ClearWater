import React, {
  useState,
} from 'react';
import BasicEditor from './BasicEditor';

const TableEditor = () => {
  const [rows, addRow] =
    useState([]);
  const [cols, addCol] =
    useState(['Cell']);

  const [
    numberOfRows,
    updatenumberOfRows,
  ] = useState(0);

  const [
    numberOfCols,
    updatenumberOfCols,
  ] = useState(0);

  function updateRows(
    event: any
  ) {
    updatenumberOfRows(
      event.target.value
    );
    addRow(() => []);

    for (
      let i = 0;
      i < event.target.value;
      i++
    ) {
      addRow((rows) => [
        ...rows,
        'New Row',
      ]);
    }
  }
  function updateCols(event) {
    updatenumberOfCols(
      event.target.value
    );
    addCol(() => []);

    for (
      let i = 0;
      i < event.target.value;
      i++
    ) {
      addCol((cols) => [
        ...cols,
        'New Row',
      ]);
    }
  }

  const createTable = (
    c,
    r
  ) => {};

  return (
    <div>
      <div>
        <h4>
          <u>
            Shortcut Keys:{' '}
          </u>
        </h4>
        <ul>
          <li>
            Bold = ctrl+b
          </li>
          <li>
            italic= ctrl+i
          </li>
          <li>
            strikethrough =
            ctrl+s
          </li>
          <li>
            Allign lef =
            ctrl+l
          </li>
          <li>
            Allign right =
            ctrl+R
          </li>
          <li>
            Allign center =
            ctrl+c
          </li>
        </ul>
      </div>
      <form>
        <label>
          Number of Cols
        </label>
        <input
          id='numcolsinput'
          type='number'
          value={numberOfCols}
          onChange={
            updateCols
          }></input>
        <br></br>
        <label>
          <label>
            Number of Rows
          </label>
        </label>
        <input
          type='number'
          value={numberOfRows}
          onChange={
            updateRows
          }></input>
      </form>
      <br></br>

      <table>
        {rows.map((r) => (
          <tr>
            {cols.map((c) => (
              <td
                style={{
                  border:
                    'solid',
                }}>
                <BasicEditor />
              </td>
            ))}
          </tr>
        ))}
      </table>
    </div>
  );
};

export default TableEditor;
