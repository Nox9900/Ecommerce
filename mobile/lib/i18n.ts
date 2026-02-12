import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

const resources = {
    en: {
        translation: {
            tabs: { home: 'Home', cart: 'Cart', chat: 'Chat', profile: 'Profile' },
            splash: {
                title: 'Nox', subtitle: '9900',
                desc: 'Discover the best products from verified vendors. Fast, secure, and premium.',
                get_started: 'Get Started', already_have_account: 'Already have an account?', sign_in: 'Sign In'
            },
            common: {
                search: 'Search', categories: 'Categories', see_all: 'See All', view_all: 'View All',
                add_to_cart: 'Add to Cart', total: 'Total', checkout: 'Checkout', featured: 'Featured',
                discover: 'Yaamaan', discover_desc: 'Shop your way', items: 'items', item: 'item',
                all: 'All', shops_to_explore: 'Shops to Explore', remove_item: 'Remove Item',
                remove_item_desc: 'Remove {{name}} from cart?', cancel: 'Cancel', remove: 'Remove',
                success: 'Success', payment_success: 'Your payment was successful! Your order is being processed.',
                loading: 'Loading...', error: 'Error', error_desc: 'Something went wrong. Please try again later.',
                filters: 'Filters', sort_by: 'Sort By', price_range: 'Price Range', minimum_rating: 'Minimum Rating',
                price_low_high: 'Price: Low to High', price_high_low: 'Price: High to Low', recent_searches: 'Recent Searches',
                clear_all: 'Clear All', latest: 'Latest', popular: 'Popular', rating: 'Rating', reset: 'Reset', apply: 'Apply'
            },
            cart: {
                title: 'Cart', loading: 'Loading cart...', empty_title: 'Your cart is empty',
                empty_desc: 'Add some products to get started', start_shopping: 'Start Shopping',
                error_title: 'Failed to load cart', error_desc: 'Please check your connection and try again',
                no_address: 'No Address', no_address_desc: 'Please add a shipping address in your profile before checking out.',
                checkout_button: 'Checkout'
            },
            chat: {
                title: 'Messages', conversations: '{{count}} conversations', loading: 'Loading chats...',
                empty_title: 'No messages yet', empty_desc: 'Start a conversation with a seller from a product page',
                unknown_user: 'Unknown User'
            },
            profile: {
                title: 'Profile', my_addresses: 'My Addresses', my_orders: 'My Orders', wishlist: 'Wishlist',
                privacy_security: 'Privacy & Security', appearance: 'Appearance', dark_mode: 'Dark Mode',
                account: 'Account', settings: 'Settings', language: 'Language', font_size: 'Font Size',
                select_font_size: 'Select Font Size', become_vendor: 'Become a Vendor',
                become_vendor_desc: 'Start your own business today', sign_out: 'Sign Out', cancel: 'Cancel',
                continue: 'Continue', select_language: 'Select Language', choose_language: 'Choose your preferred language',
                logout_error: 'Failed to sign out', version: 'Version'
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
            language: { title: 'Select Language', english: 'English', french: 'French', spanish: 'Spanish', arabic: 'Arabic', chinese: 'Chinese', russian: 'Russian', info: 'Switching languages will restart the application to apply changes correctly.' },
            db: { // Database content translations
                "Electronics": "Electronics", "Fashion": "Fashion", "Home & Garden": "Home & Garden", "Beauty": "Beauty",
                "Sports": "Sports", "Toys": "Toys", "Books": "Books", "Groceries": "Groceries", "Automotive": "Automotive"
            }
        }
    },
    fr: {
        translation: {
            tabs: { home: 'Accueil', cart: 'Panier', chat: 'Chat', profile: 'Profil' },
            splash: {
                title: 'Nox', subtitle: '9900',
                desc: 'Découvrez les meilleurs produits de vendeurs vérifiés. Rapide, sécurisé et premium.',
                get_started: 'Commencer', already_have_account: 'Vous avez déjà un compte ?', sign_in: 'Se connecter'
            },
            common: {
                search: 'Rechercher des produits...', categories: 'Catégories', see_all: 'Tout voir', view_all: 'Voir tout',
                add_to_cart: 'Ajouter au panier', total: 'Total', checkout: 'Payer', featured: 'En vedette',
                discover: 'Découvrir', discover_desc: 'Explorez une gamme infinie de produits', items: 'articles', item: 'article',
                all: 'Tout', shops_to_explore: 'Boutiques à explorer', remove_item: 'Supprimer l\'article',
                remove_item_desc: 'Supprimer {{name}} du panier ?', cancel: 'Annuler', remove: 'Supprimer',
                success: 'Succès', payment_success: 'Votre paiement a réussi ! Votre commande est en cours de traitement.',
                loading: 'Chargement...', error: 'Erreur', error_desc: 'Une erreur s\'est produite. Veuillez réessayer plus tard.',
                filters: 'Filtres', sort_by: 'Trier par', price_range: 'Plage de prix', minimum_rating: 'Note minimale',
                price_low_high: 'Prix: croi.', price_high_low: 'Prix: decroi.', recent_searches: 'Recherches récentes',
                clear_all: 'Tout effacer', latest: 'Récent', popular: 'Populaire', rating: 'Note', reset: 'Réinitialiser', apply: 'Appliquer'
            },
            cart: {
                title: 'Panier', loading: 'Chargement du panier...', empty_title: 'Votre panier est vide',
                empty_desc: 'Ajoutez des produits pour commencer', start_shopping: 'Commencer les achats',
                error_title: 'Échec du chargement du panier', error_desc: 'Veuillez vérifier votre connexion et réessayer',
                no_address: 'Pas d\'adresse', no_address_desc: 'Veuillez ajouter une adresse de livraison dans votre profil avant de payer.',
                checkout_button: 'Payer'
            },
            chat: {
                title: 'Messages', conversations: '{{count}} conversations', loading: 'Chargement des discussions...',
                empty_title: 'Pas encore de messages', empty_desc: 'Commencez une conversation avec un vendeur depuis une page produit',
                unknown_user: 'Utilisateur inconnu'
            },
            profile: {
                title: 'Profil', my_addresses: 'Mes adresses', my_orders: 'Mes commandes', wishlist: 'Liste de souhaits',
                privacy_security: 'Confidentialité et sécurité', appearance: 'Apparence', dark_mode: 'Mode sombre',
                account: 'Compte', settings: 'Paramètres', language: 'Langue', font_size: 'Taille de la police',
                select_font_size: 'Choisir la taille', become_vendor: 'Devenir vendeur',
                become_vendor_desc: 'Lancez votre propre entreprise dès aujourd\'hui', sign_out: 'Déconnexion', cancel: 'Annuler',
                continue: 'Continuer', select_language: 'Choisir la langue', choose_language: 'Choisissez votre langue préférée',
                logout_error: 'Échec de la déconnexion', version: 'Version'
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
            language: { title: 'Choisir la langue', english: 'Anglais', french: 'Français', spanish: 'Espagnol', arabic: 'Arabe', chinese: 'Chinois', russian: 'Russe', info: 'Changer de langue redémarrera l\'application pour appliquer les modifications correctement.' },
            db: {
                "Electronics": "Électronique", "Fashion": "Mode", "Home & Garden": "Maison et Jardin", "Beauty": "Beauté",
                "Sports": "Sports", "Toys": "Jouets", "Books": "Livres", "Groceries": "Épicerie", "Automotive": "Automobile"
            }
        }
    },
    es: {
        translation: {
            tabs: { home: 'Inicio', cart: 'Carrito', chat: 'Chat', profile: 'Perfil' },
            splash: {
                title: 'Nox', subtitle: '9900',
                desc: 'Descubre los mejores productos de vendedores verificados. Rápido, seguro y premium.',
                get_started: 'Empezar', already_have_account: '¿Ya tienes una cuenta?', sign_in: 'Iniciar sesión'
            },
            common: {
                search: 'Buscar productos...', categories: 'Categorías', see_all: 'Ver todo', view_all: 'Ver todo',
                add_to_cart: 'Añadir al carrito', total: 'Total', checkout: 'Pagar', featured: 'Destacado',
                discover: 'Descubrir', discover_desc: 'Explora una gama infinita de productos', items: 'artículos', item: 'artículo',
                all: 'Todo', shops_to_explore: 'Tiendas para explorar', remove_item: 'Eliminar artículo',
                remove_item_desc: '¿Eliminar {{name}} del carrito?', cancel: 'Cancelar', remove: 'Eliminar',
                success: 'Éxito', payment_success: '¡Su pago fue exitoso! Su pedido está siendo procesado.',
                loading: 'Cargando...', error: 'Error', error_desc: 'Algo salió mal. Por favor, inténtelo de nuevo más tarde.',
                filters: 'Filtros', sort_by: 'Ordenar por', price_range: 'Rango de precios', minimum_rating: 'Calificación mínima',
                price_low_high: 'Precio: bajo a alto', price_high_low: 'Precio: alto a bajo', recent_searches: 'Búsquedas recientes',
                clear_all: 'Borrar todo', latest: 'Más reciente', popular: 'Popular', rating: 'Calificación', reset: 'Restablecer', apply: 'Aplicar'
            },
            cart: {
                title: 'Carrito', loading: 'Cargando carrito...', empty_title: 'Tu carrito está vacío',
                empty_desc: 'Añade algunos productos para empezar', start_shopping: 'Empezar a comprar',
                error_title: 'Error al cargar el carrito', error_desc: 'Por favor, compruebe su conexión e inténtelo de nuevo',
                no_address: 'Sin dirección', no_address_desc: 'Por favor, añade una dirección de envío en tu perfil antes de pagar.',
                checkout_button: 'Pagar'
            },
            chat: {
                title: 'Mensajes', conversations: '{{count}} conversaciones', loading: 'Cargando chats...',
                empty_title: 'No hay mensajes aún', empty_desc: 'Inicia una conversación con un vendedor desde una página de producto',
                unknown_user: 'Usuario desconocido'
            },
            profile: {
                title: 'Perfil', my_addresses: 'Mis direcciones', my_orders: 'Mis pedidos', wishlist: 'Lista de deseos',
                privacy_security: 'Privacidad y seguridad', appearance: 'Apariencia', dark_mode: 'Modo oscuro',
                account: 'Cuenta', settings: 'Ajustes', language: 'Idioma', font_size: 'Tamaño de fuente',
                select_font_size: 'Seleccionar tamaño', become_vendor: 'Ser vendedor',
                become_vendor_desc: 'Comienza tu propio negocio hoy', sign_out: 'Cerrar sesión', cancel: 'Cancelar',
                continue: 'Continuar', select_language: 'Seleccionar idioma', choose_language: 'Elige tu idioma preferido',
                logout_error: 'Error al cerrar sesión', version: 'Versión'
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
            language: { title: 'Seleccionar idioma', english: 'Inglés', french: 'Francés', spanish: 'Español', arabic: 'Árabe', chinese: 'Chino', russian: 'Russe', info: 'Cambiar de idioma reiniciará la aplicación para aplicar los cambios correctamente.' },
            db: {
                "Electronics": "Electrónica", "Fashion": "Moda", "Home & Garden": "Hogar y Jardín", "Beauty": "Belleza",
                "Sports": "Deportes", "Toys": "Juguetes", "Books": "Livres", "Groceries": "Comestibles", "Automotive": "Automoción"
            }
        }
    },
    ar: {
        translation: {
            tabs: { home: 'الرئيسية', cart: 'السلة', chat: 'المحادثة', profile: 'الملف الشخصي' },
            splash: {
                title: 'Nox', subtitle: '9900',
                desc: 'اكتشف أفضل المنتجات من بائعين موثوقين. سريع وآمن ومتميز.',
                get_started: 'ابدأ الآن', already_have_account: 'لديك حساب بالفعل؟', sign_in: 'تسجيل الدخول'
            },
            common: {
                search: 'البحث عن منتجات...', categories: 'الفئات', see_all: 'عرض الكل', view_all: 'عرض الكل',
                add_to_cart: 'أضف إلى السلة', total: 'الإجمالي', checkout: 'الدفع', featured: 'مميز',
                discover: 'إكتشف', discover_desc: 'استكشف مجموعة لا حصر لها من المنتجات', items: 'منتجات', item: 'منتج',
                all: 'الكل', shops_to_explore: 'متاجر للاستكشاف', remove_item: 'إزالة المنتج',
                remove_item_desc: 'إزالة {{name}} من السلة؟', cancel: 'إلغاء', remove: 'إزالة',
                success: 'نجاح', payment_success: 'تمت عملية الدفع بنجاح! طلبك قيد المعالجة.',
                loading: 'جاري التحميل...', error: 'خطأ', error_desc: 'حدث خطأ ما. يرجى المحاولة مرة أخرى لاحقاً.',
                filters: 'مرشحات', sort_by: 'ترتيب حسب', price_range: 'نطاق السعر', minimum_rating: 'الحد الأدنى للتقييم',
                price_low_high: 'السعر: من الأقل للأعلى', price_high_low: 'السعر: من الأعلى للأقل', recent_searches: 'عمليات البحث الأخيرة',
                clear_all: 'مسح الكل', latest: 'الأحدث', popular: 'الأكثر شعبية', rating: 'التقييم', reset: 'إعادة تعيين', apply: 'تطبيق'
            },
            cart: {
                title: 'السلة', loading: 'جاري تحميل السلة...', empty_title: 'سلتك فارغة',
                empty_desc: 'أضف بعض المنتجات للبدء', start_shopping: 'بدء التسوق',
                error_title: 'فشل تحميل السلة', error_desc: 'يرجى التحقق من اتصالك والمحاولة مرة أخرى',
                no_address: 'لا يوجد عنوان', no_address_desc: 'يرجى إضافة عنوان شحن في ملفك الشخصي قبل الدفع.',
                checkout_button: 'الدفع'
            },
            chat: {
                title: 'الرسائل', conversations: '{{count}} محادثات', loading: 'جاري تحميل المحادثات...',
                empty_title: 'لا توجد رسائل بعد', empty_desc: 'ابدأ محادثة مع بائع من صفحة المنتج',
                unknown_user: 'مستخدم غير معروف'
            },
            profile: {
                title: 'الملف الشخصي', my_addresses: 'عناويني', my_orders: 'طلباتي', wishlist: 'قائمة الأمنيات',
                privacy_security: 'الخصوصية والأمان', appearance: 'المظهر', dark_mode: 'الوضع الداكن',
                account: 'الحساب', settings: 'الإعدادات', language: 'اللغة', font_size: 'حجم الخط',
                select_font_size: 'اختر حجم الخط', become_vendor: 'كن بائعاً',
                become_vendor_desc: 'ابدأ عملك الخاص اليوم', sign_out: 'تسجيل الخروج', cancel: 'إلغاء',
                continue: 'استمرار', select_language: 'اختر اللغة', choose_language: 'اختر لغتك المفضلة',
                logout_error: 'فشل تسجيل الخروج', version: 'الإصدار'
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
            language: { title: 'اختر اللغة', english: 'الإنجليزية', french: 'الفرنسية', spanish: 'الإسبانية', arabic: 'العربية', chinese: 'الصينية', russian: 'الروسية', info: 'سيؤدي تغيير اللغة إلى إعادة تشغيل التطبيق لتطبيق التغييرات بشكل صحيح.' },
            db: {
                "Electronics": "إلكترونيات", "Fashion": "موضة", "Home & Garden": "المنزل والحديقة", "Beauty": "جمال",
                "Sports": "رياضة", "Toys": "ألعاب", "Books": "كتب", "Groceries": "بقالة", "Automotive": "سيارات"
            }
        }
    },
    zh: {
        translation: {
            tabs: { home: '首页', cart: '购物车', chat: '聊天', profile: '个人资料' },
            splash: {
                title: 'Nox', subtitle: '9900',
                desc: '发现来自认证卖家的最佳产品。快速、安全且优质。',
                get_started: '开始', already_have_account: '已经有账户了？', sign_in: '登录'
            },
            common: {
                search: '搜索产品...', categories: '类别', see_all: '查看全部', view_all: '查看全部',
                add_to_cart: '加入购物车', total: '总计', checkout: '结算', featured: '精选',
                discover: '发现', discover_desc: '探索无限的产品系列', items: '件商品', item: '件商品',
                all: '全部', shops_to_explore: '探索店铺', remove_item: '移除商品',
                remove_item_desc: '从购物车中移除 {{name}}？', cancel: '取消', remove: '移除',
                success: '成功', payment_success: '支付成功！您的订单正在处理中。',
                loading: '加载中...', error: '错误', error_desc: '出错。请稍后再试。',
                filters: '筛选', sort_by: '排序方式', price_range: '价格范围', minimum_rating: '最低评分',
                price_low_high: '价格：从低到高', price_high_low: '价格：从高到低', recent_searches: '最近搜索',
                clear_all: '清除全部', latest: '最新', popular: '热门', rating: '评分', reset: '重置', apply: '应用'
            },
            cart: {
                title: '购物车', loading: '正在加载购物车...', empty_title: '您的购物车是空的',
                empty_desc: '添加一些产品开始使用', start_shopping: '开始购物',
                error_title: '无法加载购物车', error_desc: '请检查您的连接并重试',
                no_address: '无地址', no_address_desc: '请在结账前在您的档案中添加送货地址。',
                checkout_button: '结算'
            },
            chat: {
                title: '消息', conversations: '{{count}} 个对话', loading: '正在加载聊天...',
                empty_title: '暂无消息', empty_desc: '从产品页面开始与卖家对话',
                unknown_user: '未知用户'
            },
            profile: {
                title: '个人资料', my_addresses: '我的地址', my_orders: '我的订单', wishlist: '心愿单',
                privacy_security: '隐私与安全', appearance: '外观', dark_mode: '深色模式',
                account: '账户', settings: '设置', language: '语言', font_size: '字体大小',
                select_font_size: '选择字体大小', become_vendor: '成为卖家',
                become_vendor_desc: '今天就开始您的生意', sign_out: '退出登录', cancel: '取消',
                continue: '继续', select_language: '选择语言', choose_language: '选择您偏好的语言',
                logout_error: '退出登录失败', version: '版本'
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
            language: { title: '选择语言', english: '英语', french: '法语', spanish: '西班牙语', arabic: '阿拉伯语', chinese: '中文', russian: '俄语', info: '切换语言将重启应用程序以正确应用更改。' },
            db: {
                "Electronics": "电子产品", "Fashion": "时尚", "Home & Garden": "家居园艺", "Beauty": "美容",
                "Sports": "运动", "Toys": "玩具", "Books": "书籍", "Groceries": "食品杂货", "Automotive": "汽车"
            }
        }
    },
    ru: {
        translation: {
            tabs: { home: 'Главная', cart: 'Корзина', chat: 'Чат', profile: 'Профиль' },
            splash: {
                title: 'Nox', subtitle: '9900',
                desc: 'Откройте для себя лучшие товары от проверенных продавцов. Быстро, безопасно и качественно.',
                get_started: 'Начать', already_have_account: 'Уже есть аккаунт?', sign_in: 'Войти'
            },
            common: {
                search: 'Поиск товаров...', categories: 'Категории', see_all: 'Посмотреть все', view_all: 'Посмотреть все',
                add_to_cart: 'Добавить в корзину', total: 'Итого', checkout: 'Оформить заказ', featured: 'Рекомендуемое',
                discover: 'Обзор', discover_desc: 'Исследуйте бесконечный ассортимент товаров', items: 'товаров', item: 'товар',
                all: 'Все', shops_to_explore: 'Магазины', remove_item: 'Удалить товар',
                remove_item_desc: 'Удалить {{name}} из корзины?', cancel: 'Отмена', remove: 'Удалить',
                success: 'Успех', payment_success: 'Оплата прошла успешно! Ваш заказ обрабатывается.',
                loading: 'Загрузка...', error: 'Ошибка', error_desc: 'Что-то пошло не так. Пожалуйста, попробуйте позже.',
                filters: 'Фильтры', sort_by: 'Сортировка', price_range: 'Диапазон цен', minimum_rating: 'Минимальный рейтинг',
                price_low_high: 'Цена: по возрастанию', price_high_low: 'Цена: по убыванию', recent_searches: 'Недавние поиски',
                clear_all: 'Очистить все', latest: 'Новинки', popular: 'Популярное', rating: 'Рейтинг', reset: 'Сброс', apply: 'Применить'
            },
            cart: {
                title: 'Корзина', loading: 'Загрузка корзины...', empty_title: 'Ваша корзина пуста',
                empty_desc: 'Добавьте товары, чтобы начать', start_shopping: 'Начать покупки',
                error_title: 'Не удалось загрузить корзину', error_desc: 'Пожалуйста, проверьте соединение и попробуйте снова',
                no_address: 'Нет адреса', no_address_desc: 'Пожалуйста, добавьте адрес доставки в профиле перед оформлением заказа.',
                checkout_button: 'Оформить заказ'
            },
            chat: {
                title: 'Сообщения', conversations: '{{count}} диалогов', loading: 'Загрузка чатов...',
                empty_title: 'Сообщений пока нет', empty_desc: 'Начните диалог с продавцом со страницы товара',
                unknown_user: 'Неизвестный пользователь'
            },
            profile: {
                title: 'Профиль', my_addresses: 'Мои адреса', my_orders: 'Мои заказы', wishlist: 'Список желаний',
                privacy_security: 'Конфиденциальность', appearance: 'Внешний вид', dark_mode: 'Темная тема',
                account: 'Аккаунт', settings: 'Настройки', language: 'Язык', font_size: 'Размер шрифта',
                select_font_size: 'Выберите размер', become_vendor: 'Стать продавцом',
                become_vendor_desc: 'Начните свой бизнес сегодня', sign_out: 'Выйти', cancel: 'Отмена',
                continue: 'Продолжить', select_language: 'Выбрать язык', choose_language: 'Выберите предпочитаемый язык',
                logout_error: 'Ошибка при выходе из системы', version: 'Версия'
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
            language: { title: 'Выбрать язык', english: 'Английский', french: 'Французский', spanish: 'Испанский', arabic: 'Арабский', chinese: 'Китайский', russian: 'Русский', info: 'Смена языка приведет к перезапуску приложения для правильного применения изменений.' },
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
