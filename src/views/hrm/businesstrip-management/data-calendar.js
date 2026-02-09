const categories = [
    {
        name: 'Danger',
        value: 'bg-danger'
    },
    {
        name: 'Success',
        value: 'bg-success'
    },
    {
        name: 'Primary',
        value: 'bg-primary'
    },
    {
        name: 'Info',
        value: 'bg-info'
    },
    {
        name: 'Dark',
        value: 'bg-dark'
    },
    {
        name: 'Warning',
        value: 'bg-warning'
    },
];

const calendarEvents = [
    {
        id: 1,
        title: 'Hey!',
        start: new Date().setDate(new Date().getDate() + 2),
        className: 'bg-warning text-white',
    },
    {
        id: 2,
        title: 'See John Deo',
        start: new Date(),
        end: new Date(),
        className: 'bg-success text-white',
    },
    {
        id: 3,
        title: 'Meet John Deo',
        start: new Date().setDate(new Date().getDate() + 2),
        className: 'bg-info text-white',
    },
    {
        id: 4,
        title: 'Buy a Theme',
        start: new Date().setDate(new Date().getDate() + 4),
        className: 'bg-primary text-white'
    },
    {
        id: 4,
        title: '连续多天',
        start: new Date(),
        end: new Date().setDate(new Date().getDate() + 4),
        className: 'bg-primary text-white'
    }
];

const chatData = [
    {
        id: 1,
        image: require('@/assets/images/users/avatar-2.jpg'),
        name: 'Steven Franklin',
        message: 'Hey! there I\'m available',
        time: '5 天',
        color: 'secondary'  
    },
    {
        id: 2,
        image: require('@/assets/images/users/avatar-3.jpg'),
        name: 'Adam Miller',
        message: 'I\'ve finished it! See you so',
        time: '2 天',
        color: 'success'
    },
    {
        id: 3,
        name: 'Keith Gonzales',
        message: 'This theme is awesome!',
        time: '4 天',
        color: 'success'
    },
    {
        id: 4,
        image: require('@/assets/images/users/avatar-4.jpg'),
        name: 'Jose Vickery',
        message: 'Nice to meet you',
        time: '0.5 天',
        color: 'warning'
    },
    {
        id: 5,
        name: 'Mitchel Givens',
        message: 'Hey! there I\'m available',
        time: '3 天',
        color: 'secondary'
    },
    {
        id: 6,
        image: require('@/assets/images/users/avatar-4.jpg'),
        name: 'Stephen Hadley',
        message: 'I\'ve finished it! See you so',
        time: '5 天',
        color: 'success'
    },
    {
        id: 7,
        image: require('@/assets/images/users/avatar-2.jpg'),
        name: 'Leord Joseph',
        message: 'This theme is awesome!',
        time: '3.5 天',
        color: 'success'
    },
    {
        id: 8,
        image: require('@/assets/images/users/avatar-2.jpg'),
        name: 'Steven Franklins',
        message: 'Hey! there I\'m available',
        time: '5 天',
        color: 'secondary'  
    },
    {
        id: 9,
        image: require('@/assets/images/users/avatar-3.jpg'),
        name: 'Adam Miller',
        message: 'I\'ve finished it! See you so',
        time: '2 天',
        color: 'success'
    },
    {
        id: 10,
        name: 'Keith Gonzales',
        message: 'This theme is awesome!',
        time: '4 天',
        color: 'success'
    },
    {
        id: 11,
        image: require('@/assets/images/users/avatar-4.jpg'),
        name: 'Jose Vickery',
        message: 'Nice to meet you',
        time: '1 天',
        color: 'warning'
    },
    {
        id: 12,
        name: 'Mitchel Givens',
        message: 'Hey! there I\'m available',
        time: '3 天',
        color: 'secondary'
    },
    {
        id: 13,
        image: require('@/assets/images/users/avatar-4.jpg'),
        name: 'Stephen Hadley',
        message: 'I\'ve finished it! See you so',
        time: '5 天',
        color: 'success'
    },
    {
        id: 14,
        image: require('@/assets/images/users/avatar-2.jpg'),
        name: 'Leord Joseph',
        message: 'This theme is awesome!',
        time: '4 天',
        color: 'success'
    },
    {
        id: 15,
        image: require('@/assets/images/users/avatar-2.jpg'),
        name: 'Leord Joseph',
        message: 'This theme is awesome!',
        time: '2 天',
        color: 'success'
    },
];

export { categories, calendarEvents, chatData };
