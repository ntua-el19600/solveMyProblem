import {FC} from 'react'
import Link from 'next/link'

export const Logo: FC = () => {
  return (
    <Link className="text-xl h-8" href="/">
      solveMyProblem
    </Link>
  )
}
