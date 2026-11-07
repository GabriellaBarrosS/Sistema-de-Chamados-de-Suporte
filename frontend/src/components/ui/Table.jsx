/**
 * columns: [{ key, header, render?(row) }]
 */
export default function Table({ columns, rows, rowKey = 'id', empty = 'Nenhum registro encontrado.' }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key}>{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="table-empty">{empty}</td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row[rowKey]}>
                {columns.map((c) => (
                  <td key={c.key}>{c.render ? c.render(row) : row[c.key]}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
