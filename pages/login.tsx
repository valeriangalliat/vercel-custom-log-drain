export default function Login() {
  return (
    <form
      method="post"
      action="/api/login"
      className="container"
      style={{ maxWidth: 300 }}
    >
      <style jsx global>{`
        body {
          background-color: var(--bs-gray-100);
        }
      `}</style>
      <style jsx>{`
        .form-floating:focus-within {
          z-index: 2;
        }
      `}</style>
      <h1 className="h3 mt-5 mb-3 fw-normal text-center">Welcome back!</h1>
      <div className="form-floating">
        <input
          type="text"
          className="form-control"
          name="username"
          id="username"
          placeholder="Nickname"
          style={{
            marginBottom: -1,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
          }}
        />
        <label htmlFor="username">Nickname</label>
      </div>
      <div className="form-floating">
        <input
          type="password"
          className="form-control"
          name="password"
          id="password"
          style={{
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
          }}
        />
        <label htmlFor="password">Token</label>
      </div>
      <button className="w-100 mt-3 btn btn-lg btn-primary" type="submit">
        Sign in
      </button>
    </form>
  )
}
