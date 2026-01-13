import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

const resources = {
    en: {
        translation: {
            tabs: { home: 'Home', cart: 'Cart', chat: 'Chat', profile: 'Profile' },
            common: {
                search: 'Search products...', categories: 'Categories', see_all: 'See All', view_all: 'View All',
                add_to_cart: 'Add to Cart', total: 'Total', checkout: 'Checkout', featured: 'Featured',
                discover: 'Discover', discover_desc: 'Find your perfect item', items: 'items', item: 'item',
                all: 'All', shops_to_explore: 'Shops to Explore', remove_item: 'Remove Item',
                remove_item_desc: 'Remove {{name}} from cart?', cancel: 'Cancel', remove: 'Remove',
                success: 'Success', payment_success: 'Your payment was successful! Your order is being processed.'
            },
            profile: {
                title: 'Profile', my_addresses: 'My Addresses', my_orders: 'My Orders', wishlist: 'Wishlist',
                privacy_security: 'Privacy & Security', appearance: 'Appearance', dark_mode: 'Dark Mode',
                account: 'Account', settings: 'Settings', language: 'Language', become_vendor: 'Become a Vendor',
                become_vendor_desc: 'Start your own business today', sign_out: 'Sign Out', cancel: 'Cancel',
                continue: 'Continue', select_language: 'Select Language', choose_language: 'Choose your preferred language'
            },
            security: {
                change_password: 'Change Password', change_password_desc: 'Update your account password',
                delete_account: 'Delete Account', delete_account_desc: 'Permanently delete your account',
                delete_confirm_title: 'Are you sure?', delete_confirm_desc: 'This action is permanent and cannot be undone. All your data will be lost.',
                delete_success: 'Account deleted successfully', error_deleting: 'Error deleting account',
                password_success: 'Password updated successfully', error_updating: 'Error updating password'
            },
            notifications: {
                title: 'Notifications', empty: 'No notifications yet', order_update: 'Order Update',
                new_message: 'New Message', promotion: 'Promotion', settings_desc: 'Manage your alerts'
            },
            language: { title: 'Select Language', english: 'English', french: 'French', spanish: 'Spanish', arabic: 'Arabic', chinese: 'Chinese', russian: 'Russian' },
            db: { // Database content translations
                "Electronics": "Electronics", "Fashion": "Fashion", "Home & Garden": "Home & Garden", "Beauty": "Beauty",
                "Sports": "Sports", "Toys": "Toys", "Books": "Books", "Groceries": "Groceries", "Automotive": "Automotive"
            }
        }
    },
    fr: {
        translation: {
            tabs: { home: 'Accueil', cart: 'Panier', chat: 'Chat', profile: 'Profil' },
            common: {
                search: 'Rechercher des produits...', categories: 'Catégories', see_all: 'Tout voir', view_all: 'Voir tout',
                add_to_cart: 'Ajouter au panier', total: 'Total', checkout: 'Payer', featured: 'En vedette',
                discover: 'Découvrir', discover_desc: 'Trouvez votre article parfait', items: 'articles', item: 'article',
                all: 'Tout', shops_to_explore: 'Boutiques à explorer', remove_item: 'Supprimer l\'article',
                remove_item_desc: 'Supprimer {{name}} du panier ?', cancel: 'Annuler', remove: 'Supprimer',
                success: 'Succès', payment_success: 'Votre paiement a réussi ! Votre commande est en cours de traitement.'
            },
            profile: {
                title: 'Profil', my_addresses: 'Mes adresses', my_orders: 'Mes commandes', wishlist: 'Liste de souhaits',
                privacy_security: 'Confidentialité et sécurité', appearance: 'Apparence', dark_mode: 'Mode sombre',
                account: 'Compte', settings: 'Paramètres', language: 'Langue', become_vendor: 'Devenir vendeur',
                become_vendor_desc: 'Lancez votre propre entreprise dès aujourd\'hui', sign_out: 'Déconnexion', cancel: 'Annuler',
                continue: 'Continuer', select_language: 'Choisir la langue', choose_language: 'Choisissez votre langue préférée'
            },
            security: {
                change_password: 'Changer le mot de passe', change_password_desc: 'Mettez à jour le mot de passe de votre compte',
                delete_account: 'Supprimer le compte', delete_account_desc: 'Supprimer définitivement votre compte',
                delete_confirm_title: 'Êtes-vous sûr ?', delete_confirm_desc: 'Cette action est permanente et ne peut pas être annulée. Toutes vos données seront perdues.',
                delete_success: 'Compte supprimé avec succès', error_deleting: 'Erreur lors de la suppression du compte',
                password_success: 'Mot de passe mis à jour avec succès', error_updating: 'Erreur lors de la mise à jour du mot de passe'
            },
            notifications: {
                title: 'Notifications', empty: 'Aucune notification pour le moment', order_update: 'Mise à jour de commande',
                new_message: 'Nouveau message', promotion: 'Promotion', settings_desc: 'Gérez vos alertes'
            },
            language: { title: 'Choisir la langue', english: 'Anglais', french: 'Français', spanish: 'Espagnol', arabic: 'Arabe', chinese: 'Chinois', russian: 'Russe' },
            db: {
                "Electronics": "Électronique", "Fashion": "Mode", "Home & Garden": "Maison et Jardin", "Beauty": "Beauté",
                "Sports": "Sports", "Toys": "Jouets", "Books": "Livres", "Groceries": "Épicerie", "Automotive": "Automobile"
            }
        }
    },
    es: {
        translation: {
            tabs: { home: 'Inicio', cart: 'Carrito', chat: 'Chat', profile: 'Perfil' },
            common: {
                search: 'Buscar productos...', categories: 'Categorías', see_all: 'Ver todo', view_all: 'Ver todo',
                add_to_cart: 'Añadir al carrito', total: 'Total', checkout: 'Pagar', featured: 'Destacado',
                discover: 'Descubrir', discover_desc: 'Encuentra tu artículo perfecto', items: 'artículos', item: 'artículo',
                all: 'Todo', shops_to_explore: 'Tiendas para explorar', remove_item: 'Eliminar artículo',
                remove_item_desc: '¿Eliminar {{name}} del carrito?', cancel: 'Cancelar', remove: 'Eliminar',
                success: 'Éxito', payment_success: '¡Su pago fue exitoso! Su pedido está siendo procesado.'
            },
            profile: {
                title: 'Perfil', my_addresses: 'Mis direcciones', my_orders: 'Mis pedidos', wishlist: 'Lista de deseos',
                privacy_security: 'Privacidad y seguridad', appearance: 'Apariencia', dark_mode: 'Modo oscuro',
                account: 'Cuenta', settings: 'Ajustes', language: 'Idioma', become_vendor: 'Ser vendedor',
                become_vendor_desc: 'Comienza tu propio negocio hoy', sign_out: 'Cerrar sesión', cancel: 'Cancelar',
                continue: 'Continuar', select_language: 'Seleccionar idioma', choose_language: 'Elige tu idioma preferido'
            },
            security: {
                change_password: 'Cambiar contraseña', change_password_desc: 'Actualiza la contraseña de tu cuenta',
                delete_account: 'Eliminar cuenta', delete_account_desc: 'Eliminar tu cuenta permanentemente',
                delete_confirm_title: '¿Estás seguro?', delete_confirm_desc: 'Esta acción es permanente y no se puede deshacer. Se perderán todos tus datos.',
                delete_success: 'Cuenta eliminada con éxito', error_deleting: 'Error al eliminar la cuenta',
                password_success: 'Contraseña actualizada con éxito', error_updating: 'Error al actualizar la contraseña'
            },
            notifications: {
                title: 'Notificaciones', empty: 'No hay notificaciones aún', order_update: 'Actualización de pedido',
                new_message: 'Nuevo mensaje', promotion: 'Promoción', settings_desc: 'Gestiona tus alertas'
            },
            language: { title: 'Seleccionar idioma', english: 'Inglés', french: 'Francés', spanish: 'Español', arabic: 'Árabe', chinese: 'Chino', russian: 'Ruso' },
            db: {
                "Electronics": "Electrónica", "Fashion": "Moda", "Home & Garden": "Hogar y Jardín", "Beauty": "Belleza",
                "Sports": "Deportes", "Toys": "Juguetes", "Books": "Libros", "Groceries": "Comestibles", "Automotive": "Automoción"
            }
        }
    },
    ar: {
        translation: {
            tabs: { home: 'الرئيسية', cart: 'السلة', chat: 'المحادثة', profile: 'الملف الشخصي' },
            common: {
                search: 'البحث عن منتجات...', categories: 'الفئات', see_all: 'عرض الكل', view_all: 'عرض الكل',
                add_to_cart: 'أضف إلى السلة', total: 'الإجمالي', checkout: 'الدفع', featured: 'مميز',
                discover: 'إكتشف', discover_desc: 'ابحث عن منتجك المثالي', items: 'منتجات', item: 'منتج',
                all: 'الكل', shops_to_explore: 'متاجر للاستكشاف', remove_item: 'إزالة المنتج',
                remove_item_desc: 'إزالة {{name}} من السلة؟', cancel: 'إلغاء', remove: 'إزالة',
                success: 'نجاح', payment_success: 'تمت عملية الدفع بنجاح! طلبك قيد المعالجة.'
            },
            profile: {
                title: 'الملف الشخصي', my_addresses: 'عناويني', my_orders: 'طلباتي', wishlist: 'قائمة الأمنيات',
                privacy_security: 'الخصوصية والأمان', appearance: 'المظهر', dark_mode: 'الوضع الداكن',
                account: 'الحساب', settings: 'الإعدادات', language: 'اللغة', become_vendor: 'كن بائعاً',
                become_vendor_desc: 'ابدأ عملك الخاص اليوم', sign_out: 'تسجيل الخروج', cancel: 'إلغاء',
                continue: 'استمرار', select_language: 'اختر اللغة', choose_language: 'اختر لغتك المفضلة'
            },
            security: {
                change_password: 'تغيير كلمة المرور', change_password_desc: 'تحديث كلمة مرور حسابك',
                delete_account: 'حذف الحساب', delete_account_desc: 'حذف حسابك بشكل نهائي',
                delete_confirm_title: 'هل أنت متأكد؟', delete_confirm_desc: 'هذا الإجراء نهائي ولا يمكن التراجع عنه. ستفقد جميع بياناتك.',
                delete_success: 'تم حذف الحساب بنجاح', error_deleting: 'خطأ في حذف الحساب',
                password_success: 'تم تحديث كلمة المرور بنجاح', error_updating: 'خطأ في تحديث كلمة المرور'
            },
            notifications: {
                title: 'الإشعارات', empty: 'لا توجد إشعارات بعد', order_update: 'تحديث الطلب',
                new_message: 'رسالة جديدة', promotion: 'عرض ترويجي', settings_desc: 'إدارة التنبيهات الخاصة بك'
            },
            language: { title: 'اختر اللغة', english: 'الإنجليزية', french: 'الفرنسية', spanish: 'الإسبانية', arabic: 'العربية', chinese: 'الصينية', russian: 'الروسية' },
            db: {
                "Electronics": "إلكترونيات", "Fashion": "موضة", "Home & Garden": "المنزل والحديقة", "Beauty": "جمال",
                "Sports": "رياضة", "Toys": "ألعاب", "Books": "كتب", "Groceries": "بقالة", "Automotive": "سيارات"
            }
        }
    },
    zh: {
        translation: {
            tabs: { home: '首页', cart: '购物车', chat: '聊天', profile: '个人资料' },
            common: {
                search: '搜索产品...', categories: '类别', see_all: '查看全部', view_all: '查看全部',
                add_to_cart: '加入购物车', total: '总计', checkout: '结算', featured: '精选',
                discover: '发现', discover_desc: '寻找您的理想物品', items: '件商品', item: '件商品',
                all: '全部', shops_to_explore: '探索店铺', remove_item: '移除商品',
                remove_item_desc: '从购物车中移除 {{name}}？', cancel: '取消', remove: '移除',
                success: '成功', payment_success: '支付成功！您的订单正在处理中。'
            },
            profile: {
                title: '个人资料', my_addresses: '我的地址', my_orders: '我的订单', wishlist: '心愿单',
                privacy_security: '隐私与安全', appearance: '外观', dark_mode: '深色模式',
                account: '账户', settings: '设置', language: '语言', become_vendor: '成为卖家',
                become_vendor_desc: '今天就开始您的生意', sign_out: '退出登录', cancel: '取消',
                continue: '继续', select_language: '选择语言', choose_language: '选择您偏好的语言'
            },
            security: {
                change_password: '更改密码', change_password_desc: '更新您的账户密码',
                delete_account: '删除账户', delete_account_desc: '永久删除您的账户',
                delete_confirm_title: '您确定吗？', delete_confirm_desc: '此操作是永久性的，无法撤销。您的所有数据都将丢失。',
                delete_success: '账户已成功删除', error_deleting: '删除账户时出错',
                password_success: '密码已成功更新', error_updating: '更新密码时出错'
            },
            notifications: {
                title: '通知', empty: '暂无通知', order_update: '订单更新',
                new_message: '新消息', promotion: '促销活动', settings_desc: '管理您的提醒'
            },
            language: { title: '选择语言', english: '英语', french: '法语', spanish: '西班牙语', arabic: '阿拉伯语', chinese: '中文', russian: '俄语' },
            db: {
                "Electronics": "电子产品", "Fashion": "时尚", "Home & Garden": "家居园艺", "Beauty": "美容",
                "Sports": "运动", "Toys": "玩具", "Books": "书籍", "Groceries": "食品杂货", "Automotive": "汽车"
            }
        }
    },
    ru: {
        translation: {
            tabs: { home: 'Главная', cart: 'Корзина', chat: 'Чат', profile: 'Профиль' },
            common: {
                search: 'Поиск товаров...', categories: 'Категории', see_all: 'Посмотреть все', view_all: 'Посмотреть все',
                add_to_cart: 'Добавить в корзину', total: 'Итого', checkout: 'Оформить заказ', featured: 'Рекомендуемое',
                discover: 'Обзор', discover_desc: 'Найдите свой идеальный товар', items: 'товаров', item: 'товар',
                all: 'Все', shops_to_explore: 'Магазины', remove_item: 'Удалить товар',
                remove_item_desc: 'Удалить {{name}} из корзины?', cancel: 'Отмена', remove: 'Удалить',
                success: 'Успех', payment_success: 'Оплата прошла успешно! Ваш заказ обрабатывается.'
            },
            profile: {
                title: 'Профиль', my_addresses: 'Мои адреса', my_orders: 'Мои заказы', wishlist: 'Список желаний',
                privacy_security: 'Конфиденциальность', appearance: 'Внешний вид', dark_mode: 'Темная тема',
                account: 'Аккаунт', settings: 'Настройки', language: 'Язык', become_vendor: 'Стать продавцом',
                become_vendor_desc: 'Начните свой бизнес сегодня', sign_out: 'Выйти', cancel: 'Отмена',
                continue: 'Продолжить', select_language: 'Выбрать язык', choose_language: 'Выберите предпочитаемый язык'
            },
            security: {
                change_password: 'Сменить пароль', change_password_desc: 'Обновить пароль вашей учетной записи',
                delete_account: 'Удалить аккаунт', delete_account_desc: 'Навсегда удалить вашу учетную запись',
                delete_confirm_title: 'Вы уверены?', delete_confirm_desc: 'Это действие необратимо. Все ваши данные будут потеряны.',
                delete_success: 'Аккаунт успешно удален', error_deleting: 'Ошибка при удалении аккаунта',
                password_success: 'Пароль успешно обновлен', error_updating: 'Ошибка при обновлении пароля'
            },
            notifications: {
                title: 'Уведомления', empty: 'Уведомлений пока нет', order_update: 'Обновление заказа',
                new_message: 'Новое сообщение', promotion: 'Акция', settings_desc: 'Управление оповещениями'
            },
            language: { title: 'Выбрать язык', english: 'Английский', french: 'Французский', spanish: 'Испанский', arabic: 'Арабский', chinese: 'Китайский', russian: 'Русский' },
            db: {
                "Electronics": "Электроника", "Fashion": "Мода", "Home & Garden": "Дом и Сад", "Beauty": "Красота",
                "Sports": "Спорт", "Toys": "Игрушки", "Books": "Книги", "Groceries": "Продукты", "Automotive": "Автомобили"
            }
        }
    }
};

const LANGUAGE_DETECTOR = {
    type: 'languageDetector', async: true,
    detect: async (callback: (lang: string) => void) => {
        try {
            const language = await AsyncStorage.getItem('user-language');
            callback(language || 'en');
        } catch (error) {
            console.log('Error reading language', error);
            callback('en');
        }
    },
    init: () => { },
    cacheUserLanguage: async (language: string) => {
        try {
            await AsyncStorage.setItem('user-language', language);
        } catch (error) {
            console.log('Error saving language', error);
        }
    }
};

i18n.use(LANGUAGE_DETECTOR as any).use(initReactI18next).init({
    resources, fallbackLng: 'en', interpolation: { escapeValue: false }, react: { useSuspense: false }
});

export default i18n;
