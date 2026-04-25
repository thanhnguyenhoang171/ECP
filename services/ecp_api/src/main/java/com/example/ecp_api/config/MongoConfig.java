import com.example.ecp_api.repository.mongodb.base.SoftDeleteMongoRepositoryImpl;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@Configuration
@EnableMongoAuditing
@EnableMongoRepositories(
        basePackages = "com.example.ecp_api.repository.mongodb",
        repositoryBaseClass = SoftDeleteMongoRepositoryImpl.class
)
public class MongoConfig {
}
