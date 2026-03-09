geotab.addin.reporteKM = () => {
    let datosReporte = [];

    return {
        initialize(api, state, callback) {
            const btnConsultar = document.getElementById("btnConsultar");
            const btnExportar = document.getElementById("btnExportar");
            const yearSelect = document.getElementById("yearSelect");

            btnConsultar.addEventListener("click", async () => {
                btnConsultar.disabled = true;
                btnConsultar.innerText = "Procesando camiones...";
                const year = yearSelect.value;
                const tbody = document.querySelector("#resultTable tbody");
                tbody.innerHTML = "<tr><td colspan='5'>Cargando datos... esto puede tardar según el número de vehículos.</td></tr>";

                try {
                    const trucks = await api.call("Get", { typeName: "Device" });
                    datosReporte = [];

                    for (let truck of trucks) {
                        // Buscamos el odómetro del tacógrafo (DiagnosticOdometerId)
                        const statusData = await api.call("Get", {
                            typeName: "StatusData",
                            search: {
                                deviceSearch: { id: truck.id },
                                diagnosticSearch: { id: "DiagnosticOdometerId" },
                                fromDate: `${year}-01-01T00:00:00Z`,
                                toDate: `${year}-12-31T23:59:59Z`
                            }
                        });

                        if (statusData && statusData.length > 1) {
                            const ini = statusData[0].data / 1000;
                            const fin = statusData[statusData.length - 1].data / 1000;
                            const total = fin - ini;

                            datosReporte.push({
                                nombre: truck.name,
                                matricula: truck.licensePlate || "S/M",
                                odoIni: ini.toFixed(2),
                                odoFin: fin.toFixed(2),
                                total: total.toFixed(2)
                            });
                        }
                    }
                    renderizarTabla(datosReporte);
                } catch (error) {
                    alert("Error al consultar la API: " + error);
                } finally {
                    btnConsultar.disabled = false;
                    btnConsultar.innerText = "Consultar Datos";
                }
            });

            btnExportar.addEventListener("click", () => {
                let csv = "\uFEFFVehículo;Matrícula;Odo Inicial;Odo Final;Total KM\n";
                datosReporte.forEach(d => {
                    csv += `${d.nombre};${d.matricula};${d.odoIni};${d.odoFin};${d.total}\n`;
                });
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = `KM_Anual_${yearSelect.value}.csv`;
                link.click();
            });

            callback();
        }
    };
};

function renderizarTabla(data) {
    const tbody = document.querySelector("#resultTable tbody");
    tbody.innerHTML = "";
    if(data.length === 0) {
        tbody.innerHTML = "<tr><td colspan='5'>No se encontraron datos de odómetro de tacógrafo en el periodo seleccionado.</td></tr>";
        return;
    }
    data.forEach(item => {
        tbody.innerHTML += `<tr>
            <td>${item.nombre}</td>
            <td>${item.matricula}</td>
            <td>${item.odoIni}</td>
            <td>${item.odoFin}</td>
            <td>${item.total}</td>
        </tr>`;
    });
    document.getElementById("btnExportar").style.display = "inline-block";
}