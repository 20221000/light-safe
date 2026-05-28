import { useNavigate } from 'react-router-dom'

export function useNavigation() {
  const navigate = useNavigate()

  const handleNavigate = (key) => {
    if (key === 'map')       navigate('/')
    if (key === 'route')     navigate('/route')
    if (key === 'community') navigate('/community')
    if (key === 'myinfo')    navigate('/myinfo')
  }

  return handleNavigate
}