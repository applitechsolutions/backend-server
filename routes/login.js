var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();
var User = require('../models/user');
var UserArea = require('../models/userArea');

// GOOGLE
const { OAuth2Client } = require('google-auth-library');

const GOOGLE_CLIENT_ID = require('../config/config').GOOGLE_CLIENT_ID;
const GOOGLE_SECRET = require('../config/config').GOOGLE_SECRET;

var mdAutentificacion = require('../middlewares/auth');

/**
 * RENOVAR TOKEN
 */

app.get('/renuevatoken', mdAutentificacion.verificaToken, function (req, res) {
  var token = jwt.sign(
    {
      usuario: req.usuario,
    },
    SEED,
    {
      expiresIn: 14400,
    }
  );

  res.status(200).json({
    ok: true,
    token: token,
  });
});

/**
 * LOGIN CON GOOGLE
 */

app.post('/google', function (req, res) {
  var token = req.body.token;

  const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_SECRET, '');

  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();
    const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    User.findOne(
      {
        email: payload.email,
        state: false,
      },
      function (err, usuario) {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error al buscar usuario - login',
            errors: err,
          });
        }

        if (usuario) {
          if (usuario.google === false) {
            return res.status(400).json({
              ok: false,
              mensaje: 'Debe usar su autenticación normal',
              errors: err,
            });
          } else {
            // Crear un TOKEN
            usuario.password = ':O';

            var token = jwt.sign(
              {
                usuario: usuario,
              },
              SEED,
              {
                expiresIn: 14400,
              }
            );

            var menuTaller = [];
            var menuTransporte = [];
            var menuDistribucion = [];
            var menuContabilidad = [];
            var menuAdmin = [];
            areas.forEach(function (area) {
              switch (area._area.name) {
                case 'TALLER':
                  menuTaller = obtenerMenu(usuario.role, 'TALLER');
                  break;
                case 'TRANSPORTE':
                  menuTransporte = obtenerMenu(usuario.role, 'TRANSPORTE');
                  break;
                case 'DISTRIBUCIÓN':
                  menuDistribucion = obtenerMenu(usuario.role, 'DISTRIBUCIÓN');
                  break;
                case 'CONTABILIDAD':
                  menuContabilidad = obtenerMenu(usuario.role, 'CONTABILIDAD');
                  break;
                case 'ADMINISTRACIÓN':
                  menuAdmin = obtenerMenu(usuario.role, 'ADMINISTRACIÓN');
                  break;
                default:
                  break;
              }
            });
            res.status(200).json({
              ok: true,
              usuario: usuario,
              token: token,
              id: usuario._id,
              menuTaller: menuTaller,
              menuTransporte: menuTransporte,
              menuDistribucion: menuDistribucion,
              menuContabilidad: menuContabilidad,
              menuAdmin: menuAdmin,
            });
          }
        } else {
          // SI NO EXISTE USUARIO

          return res.status(400).json({
            ok: false,
            mensaje: 'Debe usar su autenticación normal',
            errors: err,
          });
          // var usuarioGoogle = new User();

          // usuarioGoogle.name = payload.name;
          // usuarioGoogle.email = payload.email;
          // usuarioGoogle.password = ':O';
          // usuarioGoogle.img = payload.img;
          // usuarioGoogle.role = 'USER_ROLE';
          // usuarioGoogle.google = true;

          // usuarioGoogle.save(function(err, usuarioDB) {
          //     if (err) {
          //         return res.status(500).json({
          //             ok: false,
          //             mensaje: 'Error al crear usuario con Google',
          //             errors: err
          //         });
          //     }

          //     var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });

          //     res.status(200).json({
          //         ok: true,
          //         usuario: usuarioDB,
          //         token: token,
          //         id: usuarioDB._id
          //     });
          // });
        }
      }
    );
  }
  verify().catch(console.error);
});

/**
 * LOGIN NORMAL
 */

app.post('/', function (req, res) {
  var body = req.body;

  User.findOne(
    {
      email: body.email,
      state: false,
    },
    function (err, usuarioBD) {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al buscar usuarios',
          errors: err,
        });
      }

      if (!usuarioBD) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Credenciales incorrectas - email',
          errors: err,
        });
      }

      if (!bcrypt.compareSync(body.password, usuarioBD.password)) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Credenciales incorrectas - password',
          errors: err,
        });
      }

      // Crear un TOKEN
      usuarioBD.password = ':O';
      var token = jwt.sign(
        {
          usuario: usuarioBD,
        },
        SEED,
        {
          expiresIn: 14400,
        }
      );

      UserArea.find(
        {
          _user: usuarioBD._id,
        },
        ''
      )
        .populate('_area', 'name')
        .exec(function (err, areas) {
          if (err) {
            return res.status(500).json({
              ok: false,
              mensaje: 'Error listando áreas de usuario',
              errors: err,
            });
          }
          var menuTaller = [];
          var menuTransporte = [];
          var menuDistribucion = [];
          var menuContabilidad = [];
          var menuAdmin = [];
          areas.forEach(function (area) {
            switch (area._area.name) {
              case 'TALLER':
                menuTaller = obtenerMenu(usuarioBD.role, 'TALLER');
                break;
              case 'TRANSPORTE':
                menuTransporte = obtenerMenu(usuarioBD.role, 'TRANSPORTE');
                break;
              case 'DISTRIBUCIÓN':
                menuDistribucion = obtenerMenu(usuarioBD.role, 'DISTRIBUCIÓN');
                break;
              case 'CONTABILIDAD':
                menuContabilidad = obtenerMenu(usuarioBD.role, 'CONTABILIDAD');
                break;
              case 'ADMINISTRACIÓN':
                menuAdmin = obtenerMenu(usuarioBD.role, 'ADMINISTRACIÓN');
                break;
              default:
                break;
            }
          });
          res.status(200).json({
            ok: true,
            usuario: usuarioBD,
            token: token,
            id: usuarioBD._id,
            menuTaller: menuTaller,
            menuTransporte: menuTransporte,
            menuDistribucion: menuDistribucion,
            menuContabilidad: menuContabilidad,
            menuAdmin: menuAdmin,
          });
        });
    }
  );
});

function obtenerMenu(ROLE, AREA) {
  var menu = [];
  switch (AREA) {
    case 'ADMINISTRACIÓN':
      if (ROLE === 'ADMIN_ROLE') {
        menu = [
          {
            titulo: 'Reportes',
            icono: 'menu-icon fas fa-chart-line',
            url: '/reports/purchasesByProviders',
          },
          {
            titulo: 'Materiales',
            icono: 'menu-icon fas fa-mountain',
            url: '/materials',
          },
          {
            titulo: 'Usuarios',
            icono: 'menu-icon oi oi-person',
            submenu: [
              {
                titulo: 'Listar Usuarios',
                url: '/usuarios',
              },
              {
                titulo: 'Crear Nuevo',
                url: '/usuario/new',
              },
            ],
          },
        ];
      }
      break;
    case 'TALLER':
      if (ROLE === 'ADMIN_ROLE') {
        menu = [
          {
            titulo: 'Vehículos',
            icono: 'menu-icon fas fa-truck',
            submenu: [
              {
                titulo: 'Listar Vehículos',
                url: '/vehicles',
              },
              {
                titulo: 'Combustible',
                url: '/gasolines',
              },
              {
                titulo: 'Crear Vehículo',
                url: '/vehicle/new',
              },
            ],
          },
          {
            titulo: 'Mantenimientos',
            icono: 'menu-icon fas fa-tools',
            submenu: [
              {
                titulo: 'Reparaciones y ajustes',
                url: '/repairs',
              },
              {
                titulo: 'Crear Mantenimiento',
                url: '/maintenance/new',
              },
              {
                titulo: 'Listar Mantenimientos',
                url: '/maintenances',
              },
              {
                titulo: 'Tipos disponibles',
                url: '/typeMaintenances',
              },
            ],
          },
          {
            titulo: 'Repuestos',
            icono: 'menu-icon fas fa-cogs',
            submenu: [
              {
                titulo: 'Inventario',
                url: '/parts',
              },
              {
                titulo: 'Crear Repuesto',
                url: '/part/new',
              },
            ],
          },
          {
            titulo: 'Compras',
            icono: 'menu-icon fas fa-shopping-cart',
            submenu: [
              {
                titulo: 'Nueva Compra',
                url: '/buySpare/new',
              },
              {
                titulo: 'Historial de Compras',
                url: '/buySpares',
              },
            ],
          },
          {
            titulo: 'Proveedores',
            icono: 'menu-icon fas fa-industry',
            submenu: [
              {
                titulo: 'Listar Proveedores',
                url: '/autoProviders',
              },
              {
                titulo: 'Crear Proveedor',
                url: '/autoProvider/new',
              },
            ],
          },
          {
            titulo: 'Mecánicos',
            icono: 'menu-icon fas fa-user-cog',
            submenu: [
              {
                titulo: 'Listado Mecánicos',
                url: '/mechs',
              },
              {
                titulo: 'Crear Mecánico',
                url: '/mech/new',
              },
            ],
          },
        ];
      } else if (ROLE === 'USER_ROLE') {
        menu = [
          {
            titulo: 'Mantenimientos',
            icono: 'menu-icon fas fa-tools',
            submenu: [
              {
                titulo: 'Crear Mantenimiento',
                url: '/maintenance/new',
              },
            ],
          },
        ];
      }
      break;
    case 'TRANSPORTE':
      if (ROLE === 'ADMIN_ROLE') {
        menu = [
          {
            titulo: 'Reporte Cuadros',
            icono: 'menu-icon fas fa-file-invoice',
            submenu: [
              {
                titulo: 'Crear reportes',
                url: '/gtrip/new',
              },
              {
                titulo: 'Listar reportes',
                url: '/gtrips',
              },
              {
                titulo: 'Facturación',
                icono: 'menu-icon fas fa-file-invoice-dollar',
                submenu: [
                  {
                    titulo: 'Listar facturas',
                    url: '/gbills',
                  },
                  {
                    titulo: 'Crear factura',
                    url: '/gbill/new',
                  },
                ],
              },
              {
                titulo: 'Tipos de Producción',
                icono: 'menu-icon fas fa-suitcase-rolling',
                submenu: [
                  {
                    titulo: 'Listar tipos',
                    url: '/typeTrips',
                  },
                  {
                    titulo: 'Crear tipo',
                    url: '/typeTrip/new',
                  },
                ],
              },
            ],
          },
          {
            titulo: 'Reporte Lineas',
            icono: 'menu-icon fas fa-file-alt',
            submenu: [
              {
                titulo: 'Listar reportes',
                url: '/wtrips',
              },
              {
                titulo: 'Pedidos',
                icono: 'menu-icon fas fa-receipt',
                submenu: [
                  {
                    titulo: 'Activos',
                    url: '/orders',
                  },
                  {
                    titulo: 'Crear pedido',
                    url: '/order/new',
                  },
                  {
                    titulo: 'Finalizados',
                    url: '/ordersFinished',
                  },
                ],
              },
              {
                titulo: 'Facturación',
                icono: 'menu-icon fas fa-file-invoice-dollar',
                submenu: [
                  // {
                  //     titulo: 'Listar facturas',
                  //     url: '/wbills'
                  // },
                  {
                    titulo: 'Crear factura',
                    url: '/wbill/new',
                  },
                ],
              },
              {
                titulo: 'Destinos',
                icono: 'menu-icon fas fa-map-marked-alt',
                submenu: [
                  {
                    titulo: 'Listar destinos',
                    url: '/destinations',
                  },
                  {
                    titulo: 'Crear destino',
                    url: '/destination/new',
                  },
                ],
              },
            ],
          },
          {
            titulo: 'Cisterna',
            icono: 'menu-icon fas fas fa-tint',
            submenu: [
              {
                titulo: 'Listar reportes',
                url: '/ktrips',
              },
              {
                titulo: 'Crear reportes',
                url: '/ktrip/new',
              },
              // {
              //   titulo: 'Facturación',
              //   icono: 'menu-icon fas fa-file-invoice-dollar',
              //   submenu: [
              //     {
              //       titulo: 'Listar facturas',
              //       url: '/tBills',
              //     },
              //     {
              //       titulo: 'Crear factura',
              //       url: '/tBill/new',
              //     },
              //   ],
              // },
              {
                titulo: 'Destinos',
                icono: 'menu-icon fas fa-map-marked',
                submenu: [
                  {
                    titulo: 'Listar destinos',
                    url: '/destTanks',
                  },
                  {
                    titulo: 'Crear destino',
                    url: '/destTank/new',
                  },
                ],
              },
            ],
          },
          {
            titulo: 'Clientes',
            icono: 'menu-icon fas fa-landmark',
            url: '/CPcustomers',
          },
        ];
      } else if (ROLE === 'USER_ROLE') {
      }
      break;
    case 'DISTRIBUCIÓN':
      if (ROLE === 'ADMIN_ROLE') {
        menu = [
          {
            titulo: 'Ventas',
            icono: 'menu-icon fas fa-piggy-bank',
            submenu: [
              {
                titulo: 'Listar ventas',
                url: '/sales',
              },
              {
                titulo: 'Crear venta',
                url: '/sale/new',
              },
            ],
          },
          {
            titulo: 'Caja',
            icono: 'menu-icon fas fa-cash-register',
            url: '/cd/cash',
          },
          {
            titulo: 'Clientes',
            icono: 'menu-icon fas fa-user-tag',
            url: '/customers',
          },
          {
            titulo: 'Inventario',
            icono: 'menu-icon fas fa-mountain',
            url: '/cd/storage',
          },
          {
            titulo: 'Pedidos',
            icono: 'menu-icon fas fa-calendar-plus',
            url: '/cd/orders',
          },
          {
            titulo: 'Compras',
            icono: 'menu-icon fas fa-cart-arrow-down',
            submenu: [
              {
                titulo: 'Listar créditos',
                url: '/cd/tobepaids',
              },
              {
                titulo: 'Listar compras',
                url: '/cd/purchases',
              },
              {
                titulo: 'Crear compra',
                url: '/cd/purchase',
              },
            ],
          },
          {
            titulo: 'Reportes',
            icono: 'menu-icon fas fa-chart-area',
            url: '/cd/reports',
          },
        ];
      } else if (ROLE === 'USER_ROLE') {
      }
      break;
    case 'CONTABILIDAD':
      if (ROLE === 'ADMIN_ROLE') {
        menu = [
          {
            titulo: 'Empleados',
            icono: 'menu-icon fas fa-user-tie',
            submenu: [
              {
                titulo: 'Listar Empleados',
                url: '/employees',
              },
              {
                titulo: 'Crear Empleado',
                url: '/employee/new',
              },
            ],
          },
        ];
      } else if (ROLE === 'USER_ROLE') {
      }
      break;
    default:
      break;
  }

  return menu;
}

module.exports = app;
