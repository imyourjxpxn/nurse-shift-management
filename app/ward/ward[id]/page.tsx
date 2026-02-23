export default function WardPage({ params }: { params: { wardId: string } }) {
  console.log("มาถึงหน้า Ward แล้ว", params.wardId)

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ fontSize: 30, color: "red" }}>
        🔥 มาถึงหน้า Ward แล้ว 🔥
      </h1>

      <p>Ward ID: {params.wardId}</p>
    </div>
  )
}