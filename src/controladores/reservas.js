function crearControladorReservas(servicio) {
  async function listar(req, res) {
    const reservas = await servicio.listar();
    res.render("reservas/lista", {
      titulo: "Reservas",
      reservas,
    });
  }
  async function estado(req, res) {
    const total = await servicio.contar();
    res.json({ total }); // O la forma en que tu proyecto devuelva el estado
  }
  function mostrarFormulario(req, res) {
    res.render("reservas/nueva", {
      titulo: "Nueva reserva",
      error: null,
      valores: {},
      salasPermitidas: ["Sala Norte", "Sala Sur", "Sala Este"], // 👈 Agregado
      turnosPermitidos: ["Mañana", "Tarde", "Noche"],         // 👈 Agregado
    });
  }
  async function mostrarDetalle(req, res) {
    const reserva = await servicio.obtenerPorId(req.params.id);
    if (!reserva) {
      return res.status(404).render("no-encontrado", {
        titulo: "Reserva no encontrada",
        mensaje: "No existe una reserva con ese identificador.",
      });
    }
    res.render("reservas/detalle", { titulo: reserva.persona, reserva });
  }
  async function crear(req, res) {
    await servicio.crear(req.reservaValidada);
    res.redirect("/reservas");
  }
  
// 1. GET: Mostrar el formulario de edición precargado
async function formularioEditar(req, res) {
    const { id } = req.params;
    
    const reserva = await servicio.obtenerPorId(id);
    if (!reserva) {
      return res.status(404).render("no-encontrado", {
        titulo: "Reserva no encontrada",
        mensaje: "La reserva ya no existe.",
      });
    }

    // Manejo seguro de la fecha (si es string la usa directo, si es Date la convierte)
    let fechaFormateada = "";
    if (reserva.fecha) {
      if (typeof reserva.fecha === "string") {
        fechaFormateada = reserva.fecha.trim();
      } else if (reserva.fecha instanceof Date) {
        fechaFormateada = reserva.fecha.toISOString().split('T')[0];
      }
    }

    const valores = {
      estudiante: reserva.estudiante ?? "",
      email: reserva.email ?? "",
      sala: reserva.sala ?? "",
      fecha: fechaFormateada,
      turno: reserva.turno ?? "",
      personas: reserva.personas ?? "",
      estado: reserva.estado ?? "pendiente",
    };

    res.render("reservas/editar", {
      titulo: "Editar reserva",
      error: null,
      id: reserva.id,
      reserva,
      valores,
      salasPermitidas: ["Sala Norte", "Sala Sur", "Sala Este"], // 👈 Obligatorio para el select
      turnosPermitidos: ["Mañana", "Tarde", "Noche"],         // 👈 Obligatorio para el select
    });
  }
 
async function guardarEdicion(req, res) {
    const reserva = await servicio.obtenerPorId(req.params.id);
    if (!reserva) {
      return res.status(404).render("no-encontrado", {
        titulo: "Reserva no encontrada",
        mensaje: "La reserva ya no existe. No se guardaron cambios.",
      });
    }

    const datos = req.body ?? {};

    // 👈 Solución 1: Agregamos .trim() a todos los strings para limpiar espacios accidentales
    const valores = {
      estudiante: typeof datos.estudiante === "string" ? datos.estudiante.trim() : "",
      email: typeof datos.email === "string" ? datos.email.trim() : "",
      sala: typeof datos.sala === "string" ? datos.sala.trim() : "",
      fecha: typeof datos.fecha === "string" ? datos.fecha.trim() : "",
      turno: typeof datos.turno === "string" ? datos.turno.trim() : "",
      personas: typeof datos.personas === "string" ? datos.personas.trim() : "",
      estado: typeof datos.estado === "string" ? datos.estado.trim() : "",
    };

    const permitidos = [
      "estudiante",
      "email",
      "sala",
      "fecha",
      "turno",
      "personas",
      "estado",
    ];

    let hayCamposExtra = false;
    for (const campo of Object.keys(datos)) {
      if (!permitidos.includes(campo)) hayCamposExtra = true;
    }

    const personas = valores.personas === "" ? NaN : Number(valores.personas);

    const salasValidas = ["Sala Norte", "Sala Sur", "Sala Este"];
    const turnosValidos = ["Mañana", "Tarde", "Noche"];
    const estadosValidos = ["pendiente", "confirmada"];

    const emailValido = valores.email.includes("@");

    if (
      hayCamposExtra ||
      !valores.estudiante ||
      !emailValido ||
      !salasValidas.includes(valores.sala) ||
      !valores.fecha ||
      !turnosValidos.includes(valores.turno) ||
      !Number.isFinite(personas) ||
      !Number.isInteger(personas) ||
      personas < 1 ||
      personas > 6 ||
      !estadosValidos.includes(valores.estado)
    ) {
      return res.status(400).render("reservas/editar", {
        titulo: "Editar reserva",
        error: "Por favor, completá todos los campos correctamente (revisá email, sala, turno, personas de 1 a 6 y estado).",
        id: reserva.id,
        reserva,
        valores,
        salasPermitidas: salasValidas, // 👈 Solución 2: Evita errores si la validación falla
        turnosPermitidos: turnosValidos, // 👈 Solución 2: Evita errores si la validación falla
      });
    }

    const reemplazo = {
      estudiante: valores.estudiante,
      email: valores.email,
      sala: valores.sala,
      fecha: valores.fecha,
      turno: valores.turno,
      personas,
      estado: valores.estado,
    };

    const actualizado = await servicio.reemplazar(reserva.id, reemplazo);
    if (!actualizado) {
      return res.status(404).render("no-encontrado", {
        titulo: "Reserva no encontrada",
        mensaje: "La reserva ya no existe. No se guardaron cambios.",
      });
    }

    res.redirect(303, `/reservas/${actualizado.id}`);
  }


  

  async function listarApi(req, res) {
    const permitidos = ["sala", "orden", "pagina", "limite"];
    for (const campo of Object.keys(req.query)) {
      if (!permitidos.includes(campo)) {
        return res.status(400).json({ error: "Parámetro no permitido." });
      }
    }
    const sala = req.query.sala;
    if (sala !== undefined) {
      if (typeof sala !== "string" || sala.trim() === "") {
        return res
          .status(400)
          .json({ error: "El texto de sala debe tener contenido." });
      }
    }

    let orden = "estudiante";

    if (req.query.orden !== undefined) {
      orden = req.query.orden;
      if (
        orden !== "estudiante" &&
        orden !== "personas-asc" &&
        orden !== "personas-desc"
      ) {
        return res.status(400).json({ error: "Orden no permitido." });
      }
    }
    let pagina = 1;
    if (req.query.pagina !== undefined) {
      if (typeof req.query.pagina !== "string") {
        return res
          .status(400)
          .json({ error: "Enviá un solo valor de pagina." });
      }
      pagina = Number(req.query.pagina);
      if (!Number.isInteger(pagina) || pagina < 1 || pagina > 1000) {
        return res
          .status(400)
          .json({ error: "Página fuera del rango permitido." });
      }
    }

    let limite = 2;
    if (req.query.limite !== undefined) {
      if (typeof req.query.limite !== "string") {
        return res
          .status(400)
          .json({ error: "Enviá un solo valor de limite." });
      }
      limite = Number(req.query.limite);
      if (!Number.isInteger(limite) || limite < 1 || limite > 20) {
        return res
          .status(400)
          .json({ error: "Límite fuera del rango permitido." });
      }
    }

    const resultado = await servicio.consultar(sala, orden, pagina, limite);
    res.json(resultado);
  }

  async function obtenerApi(req, res) {
    const reserva = await servicio.obtenerPorId(req.params.id);
    if (!reserva) {
      return res.status(404).json({ error: "Reserva no encontrada." });
    }
    res.json(reserva);
  }
  async function crearApi(req, res) {
    const reserva = await servicio.crear(req.reservaValidada);
    res.location(`/api/reservas/${reserva.id}`).status(201).json(reserva);
  }
  async function eliminarApi(req, res) {
    const eliminado = await servicio.eliminar(req.params.id);
    if (!eliminado) {
      return res.status(404).json({ error: "Recurso no encontrado." });
    }
    res.status(204).end();
  }
  async function reemplazarApi(req, res) {
    const reserva = await servicio.reemplazar(
      req.params.id,
      req.cambiosValidos,
    );
    if (!reserva) {
      return res.status(404).json({ error: "Recurso no encontrado." });
    }
    res.json(reserva);
  }
  async function actualizarApi(req, res) {
    const reserva = await servicio.actualizar(
      req.params.id,
      req.cambiosValidos,
    );
    if (!reserva) {
      return res.status(404).json({ error: "Recurso no encontrado." });
    }
    res.json(reserva);
  }
  return {
    listar,
    mostrarFormulario,
    mostrarDetalle,
    crear,
    listarApi,
    obtenerApi,
    crearApi,
    eliminarApi,
    reemplazarApi,
    actualizarApi,
    estado,
    formularioEditar,
    guardarEdicion,

  
  };
}
module.exports = { crearControladorReservas };
