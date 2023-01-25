import { Link } from 'react-router-dom'

const About = () => {
  return (
    <div>
      <h2>Financial Services for Rabbits</h2>
      <p>Get your very own Carrot Card!</p>
      <Link to='/accounts/new'>Get Started Today</Link>
    </div>
  )
}

export default About
