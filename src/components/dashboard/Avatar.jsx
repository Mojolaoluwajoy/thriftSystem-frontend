// The user's initials in a gradient circle.
export default function Avatar({ user, size, fontSize, fontWeight }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #7c3aed, #ec4899)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight,
        color: "#fff",
        fontSize,
      }}
    >
      {user.firstName?.[0]}
      {user.lastName?.[0]}
    </div>
  );
}
