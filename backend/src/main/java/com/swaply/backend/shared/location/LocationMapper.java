package com.swaply.backend.shared.location;

import com.swaply.backend.shared.UserCRUD.Model.Location;
import org.mapstruct.*;

@Mapper(componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)


public interface LocationMapper {
    
    @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
    Location fromLocationRequest(LocationResponse dto);

}