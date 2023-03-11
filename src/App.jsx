import React, { useState } from "react";
import { useTable } from "react-table";

// Create a default prop getter
const defaultPropGetter = () => ({});
const Table = ({
  columns,
  data,
  getColumnProps = defaultPropGetter,
  getRowProps = defaultPropGetter,
  getCellProps = defaultPropGetter,
}) => {
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({
      columns,
      data,
    });

  return (
    <table className="trackHabits" {...getTableProps()}>
      <thead>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <th {...column.getHeaderProps()} className="tableHeader">
                <span className="toolTipText">{column.render("Header")}</span>
                {column.render("Header").split(",")[0].split(" ")[1]}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, i) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps(getRowProps(row))}>
              {row.cells.map((cell) => {
                return (
                  <td
                    {...cell.getCellProps([
                      getColumnProps(cell.column),
                      getCellProps(cell),
                    ])}
                    className="tableRow"
                  >
                    {cell.render("Cell")}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

const App = (props) => {
  const { habitsArr } = props;

  // Column Headers Start
  let colArr = [];

  // Get unique dates for header row
  const uniqueDates = [...new Set(habitsArr.map((a) => a.dateName))];
  for (let i = 0; i < uniqueDates.length; i++) {
    let payload = {
      Header: uniqueDates[i],
      accessor: uniqueDates[i],
      width: 50,
    };
    colArr.push(payload);
  }
  colArr.unshift({ Header: "Date", accessor: "col1" });
  const columns = React.useMemo(() => colArr, []);
  // Column Headers End

  // Data Row start
  // Get unique habits for each data row
  const rowArr = [...new Set(habitsArr.map((a) => a.content))].map((i) => ({
    col1: i,
  })).sort((a, b) => (a.col1 > b.col1 ? 1 : -1));

  for (let i of habitsArr) {
    for (let j of rowArr) {
      if (i.content === j.col1) {
        let payload = {
          [i.dateName]: "🟩",
        };
        Object.assign(j, payload);
      }
    }
  }

  const handleBgColour = (val) => {
    if (val === "DONE") {
      return "chartreuse !important";
    } else if (val === "TODO") {
      return "red !important";
    } else {
      return "";
    }
  };

  const data = React.useMemo(() => rowArr, []);
  // Data Row End
  return (
    <Table
      columns={columns}
      data={data}
      getCellProps={(cellInfo) => ({
        style: {
          // borderRadius: "50%",
          border: "1px solid",
          margin: "0",
          padding: "10px 15px",
        },
      })}
    />
  );
};

export default App;
