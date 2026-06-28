export interface ChildItem {
  id?: number | string;
  name?: string;
  icon?: any;
  children?: ChildItem[];
  item?: any;
  url?: any;
  color?: string;
  disabled?: boolean;
  subtitle?: string;
  badge?: boolean;
  badgeType?: string;
  badgeContent?: string;
}

export interface MenuItem {
  heading?: string;
  name?: string;
  icon?: any;
  id?: number;
  to?: string;
  items?: MenuItem[];
  children?: ChildItem[];
  url?: any;
  disabled?: boolean;
  subtitle?: string;
  badgeType?: string;
  badge?: boolean;
  badgeContent?: string;
}

import { uniqueId } from "lodash";

const SidebarContent: MenuItem[] = [
  {
    heading: "Home",
    children: [
      {
        name: "Modern",
        icon: "solar:widget-2-linear",
        id: uniqueId(),
        url: "/",
      },
      {
        name: "eCommerce",
        icon: "solar:bag-5-linear",
        id: uniqueId(),
        url: "/dashboards/eCommerce",
      },
      {
        name: "Music",
        icon: "solar:music-note-linear",
        id: uniqueId(),
        url: "/dashboards/music",
      },
      {
        name: "General",
        icon: "solar:chart-linear",
        id: uniqueId(),
        url: "/dashboards/general",
      },
      {
        name: "Front Pages",
        id: uniqueId(),
        icon: "solar:document-linear",
        children: [
          {
            id: uniqueId(),
            name: "Homepage",
            url: "/frontend-pages/homepage",
          },
          {
            id: uniqueId(),
            name: "About Us",
            url: "/frontend-pages/about",
          },
          {
            id: uniqueId(),
            name: "Blog",
            url: "/frontend-pages/blog/post",
          },
          {
            id: uniqueId(),
            name: "Blog Details",
            url: "frontend-pages/blog/detail/as-yen-tumbles-gadget-loving-japan-goes-for-secondhand-iphones-",
          },
          {
            id: uniqueId(),
            name: "Portfolio",
            url: "/frontend-pages/portfolio",
          },
          {
            id: uniqueId(),
            name: "Pricing",
            url: "/frontend-pages/pricing",
          },
          {
            id: uniqueId(),
            name: "Contact Us",
            url: "/frontend-pages/contact",
          },
        ],
      },
    ],
  },
  {
    heading: "Master Data",
    children: [
      {
        name: "Tax ID",
        icon: "solar:bag-5-linear",
        id: uniqueId(),
        url: "/react-tables/master/tax-id",
      },
      {
        name: "Daily Expense",
        icon: "solar:card-money-linear",
        id: uniqueId(),
        url: "/react-tables/master/daily-expense",
      },
      {
        name: "Application Users",
        icon: "solar:users-group-rounded-linear",
        id: uniqueId(),
        url: "/react-tables/master/application-user",
      },
    ],
 },
  {
    heading: "Apps",
    children: [
      {
        name: "AI",
        icon: "solar:star-circle-linear",
        id: uniqueId(),
        children: [
          {
            id: uniqueId(),
            name: "Chat",
            url: "/apps/chat-ai",
            badge: true,
            badgeType: 'filled',
            badgeContent: 'New',
          },
          {
            id: uniqueId(),
            name: "Image ",
            url: "/apps/image-ai",
            badge: true,
            badgeType: 'filled',
            badgeContent: 'New',
          },
        ],
      },
      {
        id: uniqueId(),
        name: "Calendar",
        icon: "solar:calendar-linear",
        url: "/apps/calendar",
      },
      {
        id: uniqueId(),
        name: "Kanban",
        icon: "solar:server-minimalistic-linear",
        url: "/apps/kanban",
      },
      {
        id: uniqueId(),
        name: "Chats",
        icon: "solar:dialog-linear",
        url: "/apps/chats",
      },

      {
        id: uniqueId(),
        name: "Email",
        icon: "solar:letter-linear",
        url: "/apps/email",
      },

      {
        id: uniqueId(),
        name: "Notes",
        icon: "solar:notes-linear",
        url: "/apps/notes",
      },
      {
        id: uniqueId(),
        name: "Contacts",
        icon: "solar:users-group-rounded-linear",
        url: "/apps/contacts",
      },
      {
        name: "Invoice",
        id: uniqueId(),
        icon: "solar:bill-list-linear",
        children: [
          {
            id: uniqueId(),
            name: "List",
            url: "/apps/invoice/list",
          },
          {
            id: uniqueId(),
            name: "Details",
            url: "/apps/invoice/detail/PineappleInc",
          },
          {
            id: uniqueId(),
            name: "Create",
            url: "/apps/invoice/create",
          },
          {
            id: uniqueId(),
            name: "Edit",
            url: "/apps/invoice/edit/PineappleInc",
          },
        ],
      },
      {
        name: "User Profile",
        id: uniqueId(),
        icon: "solar:user-circle-linear",
        children: [
          {
            id: uniqueId(),
            name: "Profile",
            url: "/apps/user-profile/profile",
          },
          {
            id: uniqueId(),
            name: "Followers",
            url: "/apps/user-profile/followers",
          },
          {
            id: uniqueId(),
            name: "Friends",
            url: "/apps/user-profile/friends",
          },
          {
            id: uniqueId(),
            name: "Gallery",
            url: "/apps/user-profile/gallery",
          },
        ],
      },

      {
        name: "Blogs",
        id: uniqueId(),
        icon: "solar:sort-by-alphabet-linear",
        children: [
          {
            id: uniqueId(),
            name: "Blog Post",
            url: "/apps/blog/post",
          },
          {
            id: uniqueId(),
            name: "Blog Detail",
            url: "/apps/blog/detail/streaming-video-way-before-it-was-cool-go-dark-tomorrow",
          },
          {
            id: uniqueId(),
            name: "Blog Edit",
            url: "/apps/blog/edit",
          },
          {
            id: uniqueId(),
            name: "Blog Create",
            url: "/apps/blog/create",
          },
          {
            id: uniqueId(),
            name: "Manage Blog",
            url: "/apps/blog/manage-blog",
          },
        ],
      },
      {
        name: "Ecommerce",
        id: uniqueId(),
        icon: "solar:cart-large-2-linear",
        children: [
          {
            id: uniqueId(),
            name: "Shop",
            url: "/apps/ecommerce/shop",
          },
          {
            id: uniqueId(),
            name: "Details",
            url: "/apps/ecommerce/detail/3",
          },
          {
            id: uniqueId(),
            name: "List",
            url: "/apps/ecommerce/list",
          },
          {
            id: uniqueId(),
            name: "Checkout",
            url: "/apps/ecommerce/checkout",
          },
          {
            id: uniqueId(),
            name: "Add Product",
            url: "/apps/ecommerce/addproduct",
          },
          {
            id: uniqueId(),
            name: "Edit Product",
            url: "/apps/ecommerce/editproduct",
          },
        ],
      },
      {
        id: uniqueId(),
        name: "Tickets",
        icon: "solar:ticker-star-linear",
        url: "/apps/tickets",
      },
      {
        id: uniqueId(),
        icon: "solar:bedside-table-2-linear",
        name: "Customers",
        url: "/react-tables/user-datatable",
      },
      {
        id: uniqueId(),
        icon: "solar:bedside-table-4-linear",
        name: "Orders",
        url: "/react-tables/order-datatable",
      },
    ],
  },
  {
    heading: "UI ELEMENTS",
    children: [
      {
        name: "ShadCn",
        id: uniqueId(),
        icon: "solar:slash-square-linear",
        children: [
          {
            id: uniqueId(),
            name: "Avatar",
            url: "/shadcn-ui/avatar",
          },
          {
            id: uniqueId(),
            name: "Badge",
            url: "/shadcn-ui/badge",
          },
          {
            id: uniqueId(),
            name: "Tooltip",
            url: "/shadcn-ui/tooltip",
          },
          {
            id: uniqueId(),
            name: "Skeleton",
            url: "/shadcn-ui/skeleton",
          },
          {
            id: uniqueId(),
            name: "Alert",
            url: "/shadcn-ui/alert",
          },
          {
            id: uniqueId(),
            name: "Progressbar",
            url: "/shadcn-ui/progressbar",
          },
          {
            id: uniqueId(),
            name: "Breadcrumb",
            url: "/shadcn-ui/breadcrumb",
          },
          {
            id: uniqueId(),
            name: "Tab",
            url: "/shadcn-ui/tab",
          },
          {
            id: uniqueId(),
            name: "Dropdown",
            url: "/shadcn-ui/dropdown",
          },
          {
            id: uniqueId(),
            name: "Accordion",
            url: "/shadcn-ui/accordion",
          },
          {
            id: uniqueId(),
            name: "Card",
            url: "/shadcn-ui/card",
          },
          {
            id: uniqueId(),
            name: "Carousel",
            url: "/shadcn-ui/carousel",
          },
          {
            id: uniqueId(),
            name: "Collapsible",
            url: "/shadcn-ui/collapsible",
          },
          {
            id: uniqueId(),
            name: "Dialogs",
            url: "/shadcn-ui/dialogs",
          },
          {
            id: uniqueId(),
            name: "Drawer",
            url: "/shadcn-ui/drawer",
          },
          {
            id: uniqueId(),
            name: "Datepicker",
            url: "/shadcn-ui/datepicker",
          },
        ],
      },            
      {
        name: "Animated Comp",
        id: uniqueId(),
        icon: "solar:reel-linear",
        children: [
          {
            id: uniqueId(),
            name: "Button",
            url: "/animated-components/buttons",
          },
          {
            id: uniqueId(),
            name: "Card",
            url: "/animated-components/cards",
          },
          {
            id: uniqueId(),
            name: "Text",
            url: "/animated-components/text",
          },
          {
            id: uniqueId(),
            name: "Tables",
            url: "/animated-components/table",
          },
          {
            id: uniqueId(),
            name: "Tooltip",
            url: "/animated-components/tooltip",
          },
          {
            id: uniqueId(),
            name: "Lists",
            url: "/animated-components/lists",
          },
          {
            id: uniqueId(),
            name: "Links",
            url: "/animated-components/links",
          },
          {
            id: uniqueId(),
            name: "Slider",
            url: "/animated-components/slider",
          },
          {
            id: uniqueId(),
            name: "Forms",
            url: "/animated-components/forms",
          },
          {
            id: uniqueId(),
            name: "Tabs",
            url: "/animated-components/tabs",
          },
          {
            id: uniqueId(),
            name: "Loader",
            url: "/animated-components/loader",
          },
          {
            id: uniqueId(),
            name: "Image Comparison",
            url: "/animated-components/image-comparison",
          },
        ],
      },
    ],
  },
  {
    heading: "FORM ELEMENTS",
    children: [
      {
        name: "Shadcn Forms",
        id: uniqueId(),
        icon: "solar:banknote-2-linear",
        children: [
          {
            id: uniqueId(),
            name: "Button",
            url: "/shadcn-ui/buttons",
          },
          {
            id: uniqueId(),
            name: "Input",
            url: "/shadcn-form/input",
          },
          {
            id: uniqueId(),
            name: "Select",
            url: "/shadcn-form/select",
          },
          {
            id: uniqueId(),
            name: "Checkbox",
            url: "/shadcn-form/checkbox",
          },
          {
            id: uniqueId(),
            name: "Radio",
            url: "/shadcn-form/radio",
          },
          {
            id: uniqueId(),
            name: "Combobox",
            url: "/shadcn-ui/combobox",
          },
          {
            id: uniqueId(),
            name: "Command",
            url: "/shadcn-ui/command",
          },
        ],
      },
      {
        name: "Form layouts",
        id: uniqueId(),
        icon: "solar:documents-linear",
        children: [
          {
            id: uniqueId(),
            name: "Forms Layouts",
            url: "/forms/form-layouts",
          },
          {
            id: uniqueId(),
            name: "Forms Horizontal",
            url: "/forms/form-horizontal",
          },
          {
            id: uniqueId(),
            name: "Forms Vertical",
            url: "/forms/form-vertical",
          },
          {
            id: uniqueId(),
            name: "Form Validation",
            url: "/forms/form-validation",
          },
          {
            id: uniqueId(),
            name: 'Form Examples',
            url: '/forms/form-examples',
          },
          {
            id: uniqueId(),
            name: 'Repeater Forms',
            url: '/forms/repeater-forms',
          },
          {
            id: uniqueId(),
            name: 'Form Wizard',
            url: '/forms/form-wizard',
          },
        ],
      },
      {
        name: "Form Addons",
        id: uniqueId(),
        icon: "solar:file-favourite-linear",
        children: [
          {
            id: uniqueId(),
            name: "Select2",
            url: "/forms/form-select2",
          },
          {
            id: uniqueId(),
            name: "Autocomplete",
            url: "/forms/form-autocomplete",
          },
          {
            id: uniqueId(),
            name: "Dropzone",
            url: "/forms/form-dropzone",
          },
        ],
      },
    ],
  },
  {
    heading: "Widgets",
    children: [
      {
        name: "Cards",
        id: uniqueId(),
        icon: "solar:card-linear",
        children: [
          {
            id: uniqueId(),
            name: "Top Cards",
            url: "/widgets/cards#topCards",
          },
          {
            id: uniqueId(),
            name: "Best Selling Product Card",
            url: "/widgets/cards#bestsellingproduct",
          },
          {
            id: uniqueId(),
            name: "Payment Gatways Cards",
            url: "/widgets/cards#paymentgateway",
          },
          {
            id: uniqueId(),
            name: "Blog Cards",
            url: "/widgets/cards#blogcards",
          },
          {
            id: uniqueId(),
            name: "Products Cards",
            url: "/widgets/cards#productscards",
          },
          {
            id: uniqueId(),
            name: "Music Cards",
            url: "/widgets/cards#musiccards",
          },
          {
            id: uniqueId(),
            name: "Profile Cards",
            url: "/widgets/cards#profilecards",
          },
          {
            id: uniqueId(),
            name: "User Cards",
            url: "/widgets/cards#usercards",
          },
          {
            id: uniqueId(),
            name: "Social Cards",
            url: "/widgets/cards#socialcards",
          },
          {
            id: uniqueId(),
            name: "Settings Cards",
            url: "/widgets/cards#settingscard",
          },
          {
            id: uniqueId(),
            name: "Gift Cards",
            url: "/widgets/cards#giftcards",
          },
          {
            id: uniqueId(),
            name: "Upcomming Activity Cards",
            url: "/widgets/cards#upcommingactcard",
          },
          {
            id: uniqueId(),
            name: "Recent Transaction Card",
            url: "/widgets/cards#recenttransactioncard",
          },
          {
            id: uniqueId(),
            name: "Recent Comment Card",
            url: "/widgets/cards#recentcommentcard",
          },
          {
            id: uniqueId(),
            name: "Task List",
            url: "/widgets/cards#tasklist",
          },
          {
            id: uniqueId(),
            name: "Recent Messages",
            url: "/widgets/cards#recentmessages",
          },
          {
            id: uniqueId(),
            name: "User info Card",
            url: "/widgets/cards#userinfocard",
          },
          {
            id: uniqueId(),
            name: "Social Card",
            url: "/widgets/cards#socialcard",
          },
          {
            id: uniqueId(),
            name: "Feed Card",
            url: "/widgets/cards#feedcard",
          },
          {
            id: uniqueId(),
            name: "Poll of Week Card",
            url: "/widgets/cards#pollofweekcard",
          },
          {
            id: uniqueId(),
            name: "Result of Poll",
            url: "/widgets/cards#resultofpoll",
          },
          {
            id: uniqueId(),
            name: "Social Post Card",
            url: "/widgets/cards#socialpostcard",
          },
        ],
      },
      {
        name: "Banners",
        id: uniqueId(),
        icon: "solar:object-scan-linear",
        children: [
          {
            id: uniqueId(),
            name: "Greeting Banner",
            url: "/widgets/banners#greetingbanner",
          },
          {
            id: uniqueId(),
            name: "Download Banner",
            url: "/widgets/banners#downloadbanner",
          },
          {
            id: uniqueId(),
            name: "Empty Cart Banner",
            url: "/widgets/banners#emptybanner",
          },
          {
            id: uniqueId(),
            name: "Error Banner",
            url: "/widgets/banners#errorbanner",
          },
          {
            id: uniqueId(),
            name: "Notifications Banner",
            url: "/widgets/banners#notificationsbanner",
          },
          {
            id: uniqueId(),
            name: "Greeting Banner 2",
            url: "/widgets/banners#greetingbanner2",
          },
        ],
      },
      {
        name: "Charts",
        id: uniqueId(),
        icon: "solar:pie-chart-2-linear",
        children: [
          {
            id: uniqueId(),
            name: "Revenue Updates Chart",
            url: "/widgets/charts#revenueupdateschart",
          },
          {
            id: uniqueId(),
            name: "Yarly Breakup Chart",
            url: "/widgets/charts#yarlybreakupchart",
          },
          {
            id: uniqueId(),
            name: "Monthly Earning Chart",
            url: "/widgets/charts#monthlyearning",
          },
          {
            id: uniqueId(),
            name: "Yarly Sales Chart",
            url: "/widgets/charts#yearlysaleschart",
          },
          {
            id: uniqueId(),
            name: "Current Year Chart",
            url: "/widgets/charts#currentyear",
          },
          {
            id: uniqueId(),
            name: "Weekly Stats Chart",
            url: "/widgets/charts#weeklystatschart",
          },
          {
            id: uniqueId(),
            name: "Expance Chart",
            url: "/widgets/charts#expancechart",
          },
          {
            id: uniqueId(),
            name: "Customers Chart",
            url: "/widgets/charts#customerschart",
          },
          {
            id: uniqueId(),
            name: "Earned Chart",
            url: "/widgets/charts#revenuechart",
          },
          {
            id: uniqueId(),
            name: "Follower Chart",
            url: "/widgets/charts#followerchart",
          },
          {
            id: uniqueId(),
            name: "Visit Chart",
            url: "/widgets/charts#visitchart",
          },
          {
            id: uniqueId(),
            name: "Income Chart",
            url: "/widgets/charts#incomechart",
          },
          {
            id: uniqueId(),
            name: "Impressions Chart",
            url: "/widgets/charts#impressionschart",
          },
          {
            id: uniqueId(),
            name: "Sales Overviewchart",
            url: "/widgets/charts#salesoverviewchart",
          },
          {
            id: uniqueId(),
            name: "Total Earnings Chart",
            url: "/widgets/charts#totalearningschart",
          },
        ],
      },
    ],
  },
  {
    heading: "TABLES",
    children: [
      // {
      //   name: "Flowbite Tables",
      //   id: uniqueId(),
      //   icon: "solar:widget-add-linear",
      //   children: [
      //     {
      //       name: "Basic Tables",
      //       id: uniqueId(),
      //       url: "/tables/basic",
      //     },
      //     {
      //       name: "Striped Rows Table",
      //       id: uniqueId(),
      //       url: "/tables/striped-row",
      //     },
      //     {
      //       name: "Hover Table",
      //       id: uniqueId(),
      //       url: "/tables/hover-table",
      //     },
      //     {
      //       name: "Checkbox Table",
      //       id: uniqueId(),
      //       url: "/tables/checkbox-table",
      //     },
      //   ],
      // },
      {
        name: "Shadcn Tables",
        id: uniqueId(),
        icon: "solar:tablet-linear",
        children: [
          {
            name: "Basic Table",
            id: uniqueId(),
            url: "/shadcn-tables/basic",
          },
        ],
      },
      {
        name: "React Tables",
        id: uniqueId(),
        icon: "solar:chart-square-linear",
        children: [
          {
            id: uniqueId(),
            name: "Basic",
            url: "/react-tables/basic",
          },
          {
            id: uniqueId(),
            name: "Dense",
            url: "/react-tables/dense",
          },
          {
            id: uniqueId(),
            name: "Sorting",
            url: "/react-tables/sorting",
          },
          {
            id: uniqueId(),
            name: "Filtering",
            url: "/react-tables/filtering",
          },
          {
            id: uniqueId(),
            name: "Pagination",
            url: "/react-tables/pagination",
          },
          {
            id: uniqueId(),
            name: "Row Selection",
            url: "/react-tables/row-selection",
          },
          {
            id: uniqueId(),
            name: "Column Visibility",
            url: "/react-tables/columnvisibility",
          },
          {
            id: uniqueId(),
            name: "Editable",
            url: "/react-tables/editable",
          },
          {
            id: uniqueId(),
            name: "Sticky",
            url: "/react-tables/sticky",
          },
          {
            id: uniqueId(),
            name: "Drag & Drop",
            url: "/react-tables/drag-drop",
          },
          {
            id: uniqueId(),
            name: "Empty",
            url: "/react-tables/empty",
          },
          {
            id: uniqueId(),
            name: "Expanding",
            url: "/react-tables/expanding",
          },
        ],
      },
    ],
  },
  {
    heading: "Charts",
    children: [
      {
        name: "ApexCharts",
        id: uniqueId(),
        icon: "solar:pie-chart-3-linear",
        children: [
          {
            id: uniqueId(),
            name: "Line Chart",
            url: "/charts/apex-charts/line",
          },
          {
            id: uniqueId(),
            name: "Area Chart",
            url: "/charts/apex-charts/area",
          },
          {
            id: uniqueId(),
            name: "Gradient Chart",
            url: "/charts/apex-charts/gradient",
          },
          {
            id: uniqueId(),
            name: "Candlestick",
            url: "/charts/apex-charts/candlestick",
          },
          {
            id: uniqueId(),
            name: "Column",
            url: "/charts/apex-charts/column",
          },
          {
            id: uniqueId(),
            name: "Doughnut & Pie",
            url: "/charts/apex-charts/doughnut",
          },
          {
            id: uniqueId(),
            name: "Radialbar & Radar",
            url: "/charts/apex-charts/radialbar",
          },
        ],
      },
      {
        name: "Shadcn Charts",
        id: uniqueId(),
        icon: "solar:chart-2-linear",
        children: [
          {
            id: uniqueId(),
            name: "Line Chart",
            url: "/charts/shadcn/line",
          },
          {
            id: uniqueId(),
            name: "Area Chart",
            url: "/charts/shadcn/area",
          },
          // {
          //   id: uniqueId(),
          //   name: "Gradient Chart",
          //   url: "/charts/apex-charts/gradient",
          // },
          {
            id: uniqueId(),
            name: "Radar",
            url: "/charts/shadcn/radar",
          },
          {
            id: uniqueId(),
            name: "Bar",
            url: "/charts/shadcn/bar",
          },
          {
            id: uniqueId(),
            name: "Doughnut & Pie",
            url: "/charts/shadcn/pie",
          },
          {
            id: uniqueId(),
            name: "Radialbar & Radar",
            url: "/charts/shadcn/radial",
          },
        ],
      },
    ],
  },
  {
    heading: "Pages",
    children: [
      {
        name: "Account Setting",
        icon: "solar:settings-minimalistic-linear",
        id: uniqueId(),
        url: "/theme-pages/account-settings",
      },
      {
        name: "FAQ",
        icon: "solar:question-circle-linear",
        id: uniqueId(),
        url: "/theme-pages/faq",
      },
      {
        name: "Pricing",
        icon: "solar:tag-price-linear",
        id: uniqueId(),
        url: "/theme-pages/pricing",
      },
      {
        name: "Landingpage",
        icon: "solar:three-squares-linear",
        id: uniqueId(),
        url: "/landingpage",
      },
      {
        name: "Roll Base Access",
        icon: "solar:accessibility-linear",
        id: uniqueId(),
        url: "/theme-pages/casl",
      },
      {
        id: uniqueId(),
        name: "Integrations",
        icon: "solar:home-add-linear",
        url: "/theme-pages/inetegration",
        badge: true,
        badgeType: 'filled',
        badgeContent: 'New',
      },
      {
        id: uniqueId(),
        name: "API Keys",
        icon: "solar:key-linear",
        url: "/theme-pages/apikey",
        badge: true,
        badgeType: 'filled',
        badgeContent: 'New',
      },
    ],
  },
  {
    heading: "Icons",
    children: [
      {
        id: uniqueId(),
        name: "Iconify Icons",
        icon: "solar:structure-linear",
        url: "/icons/iconify",
      },
    ],
  },
  {
    heading: "Auth",
    children: [
      {
        id: uniqueId(),
        name: "Error",
        icon: "solar:link-broken-minimalistic-linear",
        url: "/auth/error",
      },
      {
        name: "Login",
        id: uniqueId(),
        icon: "solar:login-2-linear",
        children: [
          {
            id: uniqueId(),
            name: "Side Login",
            url: "/auth/auth1/login",
          },
          {
            id: uniqueId(),
            name: "Boxed Login",
            url: "/auth/auth2/login",
          },
        ],
      },
      {
        name: "Register",
        id: uniqueId(),
        icon: "solar:user-plus-rounded-linear",
        children: [
          {
            id: uniqueId(),
            name: "Side Register",
            url: "/auth/auth1/register",
          },
          {
            id: uniqueId(),
            name: "Boxed Register",
            url: "/auth/auth2/register",
          },
        ],
      },
      {
        name: "Forgot Password",
        id: uniqueId(),
        icon: "solar:password-linear",
        children: [
          {
            id: uniqueId(),
            name: "Side Forgot Pwd",
            url: "/auth/auth1/forgot-password",
          },
          {
            id: uniqueId(),
            name: "Boxed Forgot Pwd",
            url: "/auth/auth2/forgot-password",
          },
        ],
      },
      {
        name: "Two Steps",
        id: uniqueId(),
        icon: "solar:shield-keyhole-minimalistic-linear",
        children: [
          {
            id: uniqueId(),
            name: "Side Two Steps",
            url: "/auth/auth1/two-steps",
          },
          {
            id: uniqueId(),
            name: "Boxed Two Steps",
            url: "/auth/auth2/two-steps",
          },
        ],
      },
      {
        id: uniqueId(),
        name: "Maintenance",
        icon: "solar:settings-linear",
        url: "/auth/maintenance",
      },
    ],
  },
];

export default SidebarContent;
