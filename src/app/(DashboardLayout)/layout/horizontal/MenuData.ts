import { uniqueId } from 'lodash'

const Menuitems = [
  {
    id: uniqueId(),
    title: 'Dashboard',
    icon: 'solar:home-linear',
    href: '',
    children: [
      {
        title: 'Modern',
        icon: 'solar:widget-2-linear',
        id: uniqueId(),
        href: '/',
      },
      {
        title: 'eCommerce',
        icon: 'solar:bag-5-linear',
        id: uniqueId(),
        href: '/dashboards/eCommerce',
      },
      {
        title: 'Music',
        icon: 'solar:music-note-linear',
        id: uniqueId(),
        href: '/dashboards/music',
      },
      {
        title: 'General',
        icon: 'solar:chart-linear',
        id: uniqueId(),
        href: '/dashboards/general',
      },
      {
        id: uniqueId(),
        title: 'Front Pages',
        icon: 'solar:document-linear',
        href: '',
        children: [
          {
            title: 'Homepage',
            id: uniqueId(),
            href: '/frontend-pages/homepage',
          },
          {
            title: 'About Us',
            id: uniqueId(),
            href: '/frontend-pages/about',
          },
          {
            title: 'Blog',
            id: uniqueId(),
            href: '/frontend-pages/blog/post',
          },
          {
            title: 'Blog Details',
            id: uniqueId(),
            href: '/frontend-pages/blog/detail/streaming-video-way-before-it-was-cool-go-dark-tomorrow',
          },
          {
            title: 'Contact Us',
            id: uniqueId(),
            href: '/frontend-pages/contact',
          },
          {
            title: 'Portfolio',
            id: uniqueId(),
            href: '/frontend-pages/portfolio',
          },
          {
            title: 'Pricing',
            id: uniqueId(),
            href: '/frontend-pages/pricing',
          },
        ],
      },
    ],
  },
  {
    id: uniqueId(),
    title: 'Apps',
    icon: 'solar:archive-down-linear',
    href: '',
    children: [
      {
        id: uniqueId(),
        title: 'AI',
        icon: 'solar:star-circle-linear',
        href: '',
        children: [
          {
            title: 'Chat',
            id: uniqueId(),
            href: '/apps/chat-ai',
          },
          {
            title: 'Image',
            id: uniqueId(),
            href: '/apps/image-ai',
          },
        ],
      },
      {
        id: uniqueId(),
        title: 'Calendar',
        icon: 'solar:calendar-linear',
        href: '/apps/calendar',
      },
      {
        id: uniqueId(),
        title: 'Kanban',
        icon: 'solar:server-minimalistic-linear',
        href: '/apps/kanban',
      },
      {
        id: uniqueId(),
        title: 'Chats',
        icon: 'solar:dialog-linear',
        href: '/apps/chats',
      },

      {
        id: uniqueId(),
        title: 'Email',
        icon: 'solar:letter-linear',
        href: '/apps/email',
      },

      {
        id: uniqueId(),
        title: 'Notes',
        icon: 'solar:notes-linear',
        href: '/apps/notes',
      },
      {
        id: uniqueId(),
        title: 'Contacts',
        icon: 'solar:users-group-rounded-linear',
        href: '/apps/contacts',
      },
      {
        title: 'Invoice',
        id: uniqueId(),
        icon: 'solar:bill-list-linear',
        href: '',
        children: [
          {
            id: uniqueId(),
            title: 'List',
            href: '/apps/invoice/list',
          },
          {
            id: uniqueId(),
            title: 'Details',
            href: '/apps/invoice/detail/PineappleInc',
          },
          {
            id: uniqueId(),
            title: 'Create',
            href: '/apps/invoice/create',
          },
          {
            id: uniqueId(),
            title: 'Edit',
            href: '/apps/invoice/edit/PineappleInc',
          },
        ],
      },
      {
        title: 'User Profile',
        id: uniqueId(),
        icon: 'solar:user-circle-linear',
        href: '',
        children: [
          {
            id: uniqueId(),
            title: 'Profile',
            href: '/apps/user-profile/profile',
          },
          {
            id: uniqueId(),
            title: 'Followers',
            href: '/apps/user-profile/followers',
          },
          {
            id: uniqueId(),
            title: 'Friends',
            href: '/apps/user-profile/friends',
          },
          {
            id: uniqueId(),
            title: 'Gallery',
            href: '/apps/user-profile/gallery',
          },
        ],
      },
      {
        title: 'Blogs',
        id: uniqueId(),
        icon: 'solar:sort-by-alphabet-linear',
        href: '',
        children: [
          {
            id: uniqueId(),
            title: 'Blog Post',
            href: '/apps/blog/post',
          },
          {
            id: uniqueId(),
            title: 'Blog Detail',
            href: '/apps/blog/detail/streaming-video-way-before-it-was-cool-go-dark-tomorrow',
          },
        ],
      },
      {
        title: 'Ecommerce',
        id: uniqueId(),
        icon: 'solar:cart-large-2-linear',
        href: '',
        children: [
          {
            id: uniqueId(),
            title: 'Shop',
            href: '/apps/ecommerce/shop',
          },
          {
            id: uniqueId(),
            title: 'Details',
            href: '/apps/ecommerce/detail/3',
          },
          {
            id: uniqueId(),
            title: 'List',
            href: '/apps/ecommerce/list',
          },
          {
            id: uniqueId(),
            title: 'Checkout',
            href: '/apps/ecommerce/checkout',
          },
          {
            id: uniqueId(),
            title: 'Add Product',
            href: '/apps/ecommerce/addproduct',
          },
          {
            id: uniqueId(),
            title: 'Edit Product',
            href: '/apps/ecommerce/editproduct',
          },
        ],
      },
      {
        id: uniqueId(),
        title: 'Tickets',
        icon: 'solar:ticker-star-linear',
        href: '/apps/tickets',
      },
    ],
  },
  {
    id: uniqueId(),
    title: 'Ui Elements',
    icon: 'solar:widget-linear',
    href: '',
    children: [
      {
        id: uniqueId(),
        title: 'ShadCn',
        icon: 'solar:slash-square-linear',
        href: '',
        children: [
          {
            id: uniqueId(),
            title: 'Avatar',
            href: '/shadcn-ui/avatar',
          },
          {
            id: uniqueId(),
            title: 'Badge',
            href: '/shadcn-ui/badge',
          },
          {
            id: uniqueId(),
            title: 'Tooltip',
            href: '/shadcn-ui/tooltip',
          },
          {
            id: uniqueId(),
            title: 'Skeleton',
            href: '/shadcn-ui/skeleton',
          },
          {
            id: uniqueId(),
            title: 'Alert',
            href: '/shadcn-ui/alert',
          },
          {
            id: uniqueId(),
            title: 'Progressbar',
            href: '/shadcn-ui/progressbar',
          },
          {
            id: uniqueId(),
            title: 'Breadcrumb',
            href: '/shadcn-ui/breadcrumb',
          },
          {
            id: uniqueId(),
            title: 'Tab',
            href: '/shadcn-ui/tab',
          },
          {
            id: uniqueId(),
            title: 'Dropdown',
            href: '/shadcn-ui/dropdown',
          },
          {
            id: uniqueId(),
            title: 'Accordion',
            href: '/shadcn-ui/accordion',
          },
          {
            id: uniqueId(),
            title: 'Card',
            href: '/shadcn-ui/card',
          },
          {
            id: uniqueId(),
            title: 'Carousel',
            href: '/shadcn-ui/carousel',
          },
          {
            id: uniqueId(),
            title: 'Collapsible',
            href: '/shadcn-ui/collapsible',
          },
          {
            id: uniqueId(),
            title: 'Dialogs',
            href: '/shadcn-ui/dialogs',
          },
          {
            id: uniqueId(),
            title: 'Drawer',
            href: '/shadcn-ui/drawer',
          },
          {
            id: uniqueId(),
            title: 'Datepicker',
            href: '/shadcn-ui/datepicker',
          },
        ],
      },
      {
        id: uniqueId(),
        title: 'Animated Comp',
        icon: 'solar:reel-linear',
        href: '',
        children: [
          {
            id: uniqueId(),
            title: 'Button',
            href: '/animated-components/buttons',
          },
          {
            id: uniqueId(),
            title: 'Card',
            href: '/animated-components/cards',
          },
          {
            id: uniqueId(),
            title: 'Text',
            href: '/animated-components/text',
          },
          {
            id: uniqueId(),
            title: 'Tables',
            href: '/animated-components/tables',
          },
          {
            id: uniqueId(),
            title: 'Tooltip',
            href: '/animated-components/tooltip',
          },
          {
            id: uniqueId(),
            title: 'Lists',
            href: '/animated-components/lists',
          },
          {
            id: uniqueId(),
            title: 'Links',
            href: '/animated-components/links',
          },
          {
            id: uniqueId(),
            title: 'Slider',
            href: '/animated-components/slider',
          },
          {
            id: uniqueId(),
            title: 'Forms',
            href: '/animated-components/forms',
          },
          {
            id: uniqueId(),
            title: 'Tabs',
            href: '/animated-components/tabs',
          },
          {
            id: uniqueId(),
            title: 'Loader',
            href: '/animated-components/loader',
          },
          {
            id: uniqueId(),
            title: 'Image Comparison',
            href: '/animated-components/image-comparison',
          },
        ],
      },
    ],
  },
  {
    id: uniqueId(),
    title: 'Widgets',
    icon: 'solar:widget-4-linear',
    href: '',
    children: [
      {
        title: 'Cards',
        id: uniqueId(),
        icon: 'solar:card-linear',
        href: '',
        children: [
          {
            id: uniqueId(),
            title: 'Top Cards',
            href: '/widgets/card#topCards',
          },
          {
            id: uniqueId(),
            title: 'Best Selling Product Card',
            href: '/widgets/card#bestsellingproduct',
          },
          {
            id: uniqueId(),
            title: 'Payment Gatways Cards',
            href: '/widgets/card#paymentgateway',
          },
          {
            id: uniqueId(),
            title: 'Blog Cards',
            href: '/widgets/card#blogcards',
          },
          {
            id: uniqueId(),
            title: 'Products Cards',
            href: '/widgets/card#productscards',
          },
          {
            id: uniqueId(),
            title: 'Music Cards',
            href: '/widgets/card#musiccards',
          },
          {
            id: uniqueId(),
            title: 'Profile Cards',
            href: '/widgets/card#profilecards',
          },
          {
            id: uniqueId(),
            title: 'User Cards',
            href: '/widgets/card#usercards',
          },
          {
            id: uniqueId(),
            title: 'Social Cards',
            href: '/widgets/card#socialcards',
          },
          {
            id: uniqueId(),
            title: 'Settings Cards',
            href: '/widgets/card#settingscard',
          },
          {
            id: uniqueId(),
            title: 'Gift Cards',
            href: '/widgets/card#giftcards',
          },
          {
            id: uniqueId(),
            title: 'Upcomming Activity Cards',
            href: '/widgets/card#upcommingactcard',
          },
          {
            id: uniqueId(),
            title: 'Recent Transaction Card',
            href: '/widgets/card#recenttransactioncard',
          },
          {
            id: uniqueId(),
            title: 'Recent Comment Card',
            href: '/widgets/card#recentcommentcard',
          },
          {
            id: uniqueId(),
            title: 'Task List',
            href: '/widgets/card#tasklist',
          },
          {
            id: uniqueId(),
            title: 'Recent Messages',
            href: '/widgets/card#recentmessages',
          },
          {
            id: uniqueId(),
            title: 'User info Card',
            href: '/widgets/card#userinfocard',
          },
          {
            id: uniqueId(),
            title: 'Social Card',
            href: '/widgets/card#socialcard',
          },
          {
            id: uniqueId(),
            title: 'Feed Card',
            href: '/widgets/card#feedcard',
          },
          {
            id: uniqueId(),
            title: 'Poll of Week Card',
            href: '/widgets/card#pollofweekcard',
          },
          {
            id: uniqueId(),
            title: 'Result of Poll',
            href: '/widgets/card#resultofpoll',
          },
          {
            id: uniqueId(),
            title: 'Social Post Card',
            href: '/widgets/card#socialpostcard',
          },
        ],
      },
      {
        title: 'Banners',
        id: uniqueId(),
        icon: 'solar:object-scan-linear',
        href: '',
        children: [
          {
            id: uniqueId(),
            title: 'Greeting Banner',
            href: '/widgets/banner#greetingbanner',
          },
          {
            id: uniqueId(),
            title: 'Download Banner',
            href: '/widgets/banner#downloadbanner',
          },
          {
            id: uniqueId(),
            title: 'Empty Cart Banner',
            href: '/widgets/banner#emptybanner',
          },
          {
            id: uniqueId(),
            title: 'Error Banner',
            href: '/widgets/banner#errorbanner',
          },
          {
            id: uniqueId(),
            title: 'Notifications Banner',
            href: '/widgets/banner#notificationsbanner',
          },
          {
            id: uniqueId(),
            title: 'Greeting Banner 2',
            href: '/widgets/banner#greetingbanner2',
          },
        ],
      },
      {
        title: 'Charts',
        id: uniqueId(),
        icon: 'solar:pie-chart-2-linear',
        href: '',
        children: [
          {
            id: uniqueId(),
            title: 'Revenue Updates Chart',
            href: '/widgets/chart#revenueupdateschart',
          },
          {
            id: uniqueId(),
            title: 'Yarly Breakup Chart',
            href: '/widgets/chart#yarlybreakupchart',
          },
          {
            id: uniqueId(),
            title: 'Monthly Earning Chart',
            href: '/widgets/chart#monthlyearning',
          },
          {
            id: uniqueId(),
            title: 'Yarly Sales Chart',
            href: '/widgets/chart#yearlysaleschart',
          },
          {
            id: uniqueId(),
            title: 'Current Year Chart',
            href: '/widgets/chart#currentyear',
          },
          {
            id: uniqueId(),
            title: 'Weekly Stats Chart',
            href: '/widgets/chart#weeklystatschart',
          },
          {
            id: uniqueId(),
            title: 'Expance Chart',
            href: '/widgets/chart#expancechart',
          },
          {
            id: uniqueId(),
            title: 'Customers Chart',
            href: '/widgets/chart#customerschart',
          },
          {
            id: uniqueId(),
            title: 'Earned Chart',
            href: '/widgets/chart#revenuechart',
          },
          {
            id: uniqueId(),
            title: 'Follower Chart',
            href: '/widgets/chart#followerchart',
          },
          {
            id: uniqueId(),
            title: 'Visit Chart',
            href: '/widgets/chart#visitchart',
          },
          {
            id: uniqueId(),
            title: 'Income Chart',
            href: '/widgets/chart#incomechart',
          },
          {
            id: uniqueId(),
            title: 'Impressions Chart',
            href: '/widgets/chart#impressionschart',
          },
          {
            id: uniqueId(),
            title: 'Sales Overviewchart',
            href: '/widgets/chart#salesoverviewchart',
          },
          {
            id: uniqueId(),
            title: 'Total Earnings Chart',
            href: '/widgets/chart#totalearningschart',
          },
        ],
      },
    ],
  },
  {
    id: uniqueId(),
    title: 'Pages',
    icon: 'solar:book-linear',
    href: '',
    children: [
      {
        title: 'Account Setting',
        icon: 'solar:settings-minimalistic-linear',
        id: uniqueId(),
        href: '/theme-pages/account-settings',
      },
      {
        title: 'FAQ',
        icon: 'solar:question-circle-linear',
        id: uniqueId(),
        href: '/theme-pages/faq',
      },
      {
        title: 'Pricing',
        icon: 'solar:tag-price-linear',
        id: uniqueId(),
        href: '/theme-pages/pricing',
      },
      {
        title: 'Landingpage',
        icon: 'solar:three-squares-linear',
        id: uniqueId(),
        href: '/landingpage',
      },
      {
        title: 'Roll Base Access',
        icon: 'solar:accessibility-linear',
        id: uniqueId(),
        href: '/theme-pages/casl',
      },
      {
        title: 'Integrations',
        id: uniqueId(),
        icon: 'solar:home-add-linear',
        href: '/theme-pages/integration',
      },
      {
        id: uniqueId(),
        title: 'API Keys',
        icon: 'solar:key-linear',
        href: '/theme-pages/apikey',
      },
      {
        id: uniqueId(),
        title: 'Auth',
        icon: 'solar:shield-keyhole-linear',
        href: '/400',
        children: [
          {
            id: uniqueId(),
            title: 'Error',
            icon: 'solar:link-broken-minimalistic-linear',
            href: '/auth/error',
          },
          {
            title: 'Login',
            id: uniqueId(),
            icon: 'solar:login-linear',
            href: '/auth/auth1/login',
            children: [
              {
                id: uniqueId(),
                title: 'Side Login',
                href: '/auth/auth1/login',
              },
              {
                id: uniqueId(),
                title: 'Boxed Login',
                href: '/auth/auth2/login',
              },
            ],
          },
          {
            title: 'Register',
            id: uniqueId(),
            icon: 'solar:user-plus-linear',
            href: '/auth/auth1/register',
            children: [
              {
                id: uniqueId(),
                title: 'Side Register',
                href: '/auth/auth1/register',
              },
              {
                id: uniqueId(),
                title: 'Boxed Register',
                href: '/auth/auth2/register',
              },
            ],
          },
          {
            title: 'Forgot Password',
            id: uniqueId(),
            icon: 'solar:restart-linear',
            href: '/auth/auth1/forgot-password',
            children: [
              {
                id: uniqueId(),
                title: 'Side Forgot Pwd',
                href: '/auth/auth1/forgot-password',
              },
              {
                id: uniqueId(),
                title: 'Boxed Forgot Pwd',
                href: '/auth/auth2/forgot-password',
              },
            ],
          },
          {
            title: 'Two Steps',
            id: uniqueId(),
            icon: 'solar:shield-star-linear',
            href: '/auth/auth1/two-steps',
            children: [
              {
                id: uniqueId(),
                title: 'Side Two Steps',
                href: '/auth/auth1/two-steps',
              },
              {
                id: uniqueId(),
                title: 'Boxed Two Steps',
                href: '/auth/auth2/two-steps',
              },
            ],
          },
          {
            id: uniqueId(),
            title: 'Maintenance',
            href: '/auth/maintenance',
          },
        ],
      },
      {
        id: uniqueId(),
        title: 'Iconify Icons',
        icon: 'solar:structure-linear',
        href: '/icons/iconify',
      },
    ],
  },
  {
    id: uniqueId(),
    title: 'Forms',
    icon: 'solar:documents-linear',
    href: '',
    children: [
      {
        title: 'Shadcn Forms',
        id: uniqueId(),
        icon: 'solar:banknote-2-linear',
        href: '',
        children: [
          {
            id: uniqueId(),
            title: 'Button',
            href: '/shadcn-ui/buttons',
          },
          {
            id: uniqueId(),
            title: 'Input',
            href: '/shadcn-ui/input',
          },
          {
            id: uniqueId(),
            title: 'Select',
            href: '/shadcn-ui/select',
          },
          {
            id: uniqueId(),
            title: 'Checkbox',
            href: '/shadcn-ui/checkbox',
          },
          {
            id: uniqueId(),
            title: 'Radio',
            href: '/shadcn-ui/radio',
          },
          {
            id: uniqueId(),
            title: 'Combobox',
            href: '/shadcn-ui/combobox',
          },
          {
            id: uniqueId(),
            title: 'Command',
            href: '/shadcn-ui/command',
          },
        ],
      },


      {
        title: 'Form layouts',
        id: uniqueId(),
        icon: 'solar:documents-linear',
        href: '',
        children: [
          {
            id: uniqueId(),
            title: 'Forms Layouts',
            href: '/forms/form-layouts',
          },
          {
            id: uniqueId(),
            title: 'Forms Horizontal',
            href: '/forms/form-horizontal',
          },
          {
            id: uniqueId(),
            title: 'Forms Vertical',
            href: '/forms/form-vertical',
          },
          {
            id: uniqueId(),
            title: 'Form Validation',
            href: '/forms/form-validation',
          },
          {
            id: uniqueId(),
            title: 'Form Examples',
            href: '/forms/form-examples',
          },
          {
            id: uniqueId(),
            title: 'Repeater Forms',
            href: '/forms/repeater-forms',
          },
          {
            id: uniqueId(),
            title: 'Form Wizard',
            href: '/forms/form-wizard',
          },
        ],
      },
      {
        title: 'Form Addons',
        id: uniqueId(),
        icon: 'solar:file-favourite-linear',
        href: '',
        children: [
          {
            id: uniqueId(),
            title: 'Select2',
            href: '/forms/form-select2',
          },
          {
            id: uniqueId(),
            title: 'Autocomplete',
            href: '/forms/form-autocomplete',
          },
          {
            id: uniqueId(),
            title: 'Dropzone',
            href: '/forms/form-dropzone',
          },
        ],
      },
    ],
  },
  {
    id: uniqueId(),
    title: 'Charts',
    icon: 'solar:pie-chart-2-linear',
    href: '/charts/',
    children: [
      {
        title: 'ApexCharts',
        id: uniqueId(),
        icon: 'solar:pie-chart-3-linear',
        href: '',
        children: [
          {
            id: uniqueId(),
            title: 'Line Chart',
            href: '/charts/apex-charts/line',
          },
          {
            id: uniqueId(),
            title: 'Area Chart',
            href: '/charts/apex-charts/area',
          },
          {
            id: uniqueId(),
            title: 'Gradient Chart',
            href: '/charts/apex-charts/gradient',
          },
          {
            id: uniqueId(),
            title: 'Candlestick',
            href: '/charts/apex-charts/candlestick',
          },
          {
            id: uniqueId(),
            title: 'Column',
            href: '/charts/apex-charts/column',
          },
          {
            id: uniqueId(),
            title: 'Doughnut & Pie',
            href: '/charts/apex-charts/doughnut',
          },
          {
            id: uniqueId(),
            title: 'Radialbar & Radar',
            href: '/charts/apex-charts/radialbar',
          },
        ],
      },
      {
        title: 'Shadcn Charts',
        id: uniqueId(),
        icon: 'solar:chart-2-linear',
        href: '',
        children: [
          {
            id: uniqueId(),
            title: 'Line Chart',
            href: '/charts/shadcn/line',
          },
          {
            id: uniqueId(),
            title: 'Area Chart',
            href: '/charts/shadcn/area',
          },
          // {
          //   id: uniqueId(),
          //   title: "Gradient Chart",
          //   href: "/charts/apex-charts/gradient",
          // },
          {
            id: uniqueId(),
            title: 'Radar',
            href: '/charts/shadcn/radar',
          },
          {
            id: uniqueId(),
            title: 'Bar',
            href: '/charts/shadcn/bar',
          },
          {
            id: uniqueId(),
            title: 'Doughnut & Pie',
            href: '/charts/shadcn/pie',
          },
          {
            id: uniqueId(),
            title: 'Radialbar & Radar',
            href: '/charts/shadcn/radial',
          },
        ],
      },
    ],
  },
  {
    id: uniqueId(),
    title: 'Tables',
    icon: 'solar:sidebar-minimalistic-linear',
    href: '',
    children: [
      {
        title: "Shadcn Tables",
        id: uniqueId(),
        icon: "solar:tablet-linear",
        children: [
          {
            title: "Basic Table",
            id: uniqueId(),
            href: "/shadcn-tables/basic",
          },
        ],
      },
      {
        id: uniqueId(),
        title: 'React Tables',
        icon: 'solar:record-linear',
        href: '',
        children: [
          {
            id: uniqueId(),
            title: 'Basic',
            href: '/react-tables/basic',
          },
          {
            id: uniqueId(),
            title: 'Dense',
            href: '/react-tables/dense',
          },
          {
            id: uniqueId(),
            title: 'Sorting',
            href: '/react-tables/sorting',
          },
          {
            id: uniqueId(),
            title: 'Filtering',
            href: '/react-tables/filtering',
          },
          {
            id: uniqueId(),
            title: 'Pagination',
            href: '/react-tables/pagination',
          },
          {
            id: uniqueId(),
            title: 'Row Selection',
            href: '/react-tables/row-selection',
          },
          {
            id: uniqueId(),
            title: 'Column Visibility',
            href: '/react-tables/columnvisibility',
          },
          {
            id: uniqueId(),
            title: 'Editable',
            href: '/react-tables/editable',
          },
          {
            id: uniqueId(),
            title: 'Sticky',
            href: '/react-tables/sticky',
          },
          {
            id: uniqueId(),
            title: 'Drag & Drop',
            href: '/react-tables/drag-drop',
          },
          {
            id: uniqueId(),
            title: 'Empty',
            href: '/react-tables/empty',
          },
          {
            id: uniqueId(),
            title: 'Expanding',
            href: '/react-tables/expanding',
          },
        ],
      },
    ],
  },
]
export default Menuitems
