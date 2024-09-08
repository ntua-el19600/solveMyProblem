import {SignUp} from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="grid place-items-center h-[calc(100%-6rem)]">
      <SignUp />
    </div>
  )
}
