import { type ThemeConfig, extendTheme } from '@chakra-ui/react'

import colors from './colors'
import Badge from './components/badge'
import Button from './components/button'
import Container from './components/container'
import Divider from './components/divider'
import { Form, FormError } from './components/formControl'
import Input from './components/input'
import Modal from './components/modal'
import Popover from './components/popover'
import Progress from './components/progress'
import Switch from './components/switch'
import Tabs from './components/tabs'
import Text from './components/text'
import Tooltip from './components/tooltip'
import styles, { breakpoints } from './styles'

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
}

const theme = extendTheme({
  config,
  colors,
  styles,
  breakpoints,
  components: {
    Button,
    Container,
    Input,
    Text,
    FormError,
    Form,
    Tabs,
    Divider,
    Popover,
    Modal,
    Progress,
    Tooltip,
    Switch,
    Badge,
  },
})

export default theme
