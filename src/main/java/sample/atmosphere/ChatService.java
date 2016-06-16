package sample.atmosphere;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.atmosphere.config.managed.Decoder;
import org.atmosphere.config.managed.Encoder;
import org.atmosphere.config.service.Disconnect;
import org.atmosphere.config.service.ManagedService;
import org.atmosphere.config.service.Ready;
import org.atmosphere.cpr.AtmosphereResource;
import org.atmosphere.cpr.AtmosphereResourceEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.StringUtils;

import com.fasterxml.jackson.databind.ObjectMapper;

@ManagedService(path = "/chat")
public class ChatService {

	private final Logger logger = LoggerFactory.getLogger(ChatService.class);

	private static Map<String, String> usercache = new HashMap<String, String>();

	@Ready
	public void onReady(final AtmosphereResource resource) {
		this.logger.info("连接 {}", resource.uuid());
	}

	@Disconnect
	public void onDisconnect(AtmosphereResourceEvent event) {
		this.logger.info("{} 下线了....", event.getResource().uuid());
	}

	@org.atmosphere.config.service.Message(encoders = JacksonEncoderDecoder.class, decoders = JacksonEncoderDecoder.class)
	public Message onMessage(Message message) throws IOException {
		this.logger.info("{} 说: {}", message.getAuthor(), message.getMessage());
		return message;
	}

	public static class JacksonEncoderDecoder implements Encoder<Message, String>, Decoder<String, Message> {

		private final ObjectMapper mapper = new ObjectMapper();

		@Override
		public String encode(Message m) {
			try {
				return this.mapper.writeValueAsString(m);
			} catch (IOException ex) {
				throw new IllegalStateException(ex);
			}
		}

		@Override
		public Message decode(String s) {
			try {
				return this.mapper.readValue(s, Message.class);
			} catch (IOException ex) {
				throw new IllegalStateException(ex);
			}
		}

	}

}
