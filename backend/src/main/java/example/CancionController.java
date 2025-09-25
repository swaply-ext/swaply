/*package  example;

import com.swaply.backend.domain.model.Cancion;
import com.swaply.backend.domain.repository.CancionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/canciones")
public class CancionController {

    @Autowired
    private CancionRepository repo;

    @GetMapping("/obtenertodas")
    public List<Cancion> obtenerTodas() {
        List<Cancion> lista = new ArrayList<>();
        repo.findAll().forEach(lista::add);
        return lista;
    }

    @PostMapping("/crear")
    public Cancion crear(@RequestBody Cancion cancion) {
        return repo.save(cancion);
    }

    @GetMapping("/{id}")
    public Cancion obtenerPorId(@PathVariable String id) {
        return repo.findById(id).orElse(null);
    }

    @PutMapping("/{id}")
    public Cancion actualizar(@PathVariable String id, @RequestBody Cancion nueva) {
        nueva.setId(id);
        return repo.save(nueva);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable String id) {
        repo.deleteById(id);
    }
}
*/